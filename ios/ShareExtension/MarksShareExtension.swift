//
//  MarksShareExtension.swift
//  Share Extension for Marks — appears in the iOS Share Sheet so the user
//  can hit "Marks" from Safari (or any app) to save the current URL.
//
//  After adding a new Share Extension target in Xcode (File → New → Target →
//  Share Extension), REPLACE the auto-generated ShareViewController with this
//  file's contents.
//
//  The extension reads the shared URL/text, then opens the host app via a
//  custom URL scheme that Capacitor exposes (marks://?url=...&title=...).
//  The Marks home page already handles those query params and pops up the
//  save dialog pre-filled.
//

import UIKit
import Social
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .clear
        extractAndOpen()
    }

    private func extractAndOpen() {
        guard let extensionContext = self.extensionContext,
              let item = extensionContext.inputItems.first as? NSExtensionItem,
              let attachments = item.attachments else {
            self.completeRequest()
            return
        }

        let title = item.attributedContentText?.string ?? ""

        // Try URL first; fall back to plain text containing a URL.
        let group = DispatchGroup()
        var sharedURL: String? = nil

        for provider in attachments {
            if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                group.enter()
                provider.loadItem(forTypeIdentifier: UTType.url.identifier) { (item, _) in
                    if let url = item as? URL {
                        sharedURL = url.absoluteString
                    }
                    group.leave()
                }
                break
            } else if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                group.enter()
                provider.loadItem(forTypeIdentifier: UTType.plainText.identifier) { (item, _) in
                    if let text = item as? String,
                       let detector = try? NSDataDetector(types: NSTextCheckingResult.CheckingType.link.rawValue),
                       let match = detector.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)),
                       let url = match.url {
                        sharedURL = url.absoluteString
                    }
                    group.leave()
                }
                break
            }
        }

        group.notify(queue: .main) {
            guard let url = sharedURL,
                  let encodedURL = url.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) else {
                self.completeRequest()
                return
            }
            let encodedTitle = title.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
            let deepLink = "marks://?url=\(encodedURL)&title=\(encodedTitle)"
            if let appURL = URL(string: deepLink) {
                self.openURL(appURL)
            }
            self.completeRequest()
        }
    }

    // Opens the URL via the responder chain — required from inside an extension.
    @objc private func openURL(_ url: URL) {
        var responder: UIResponder? = self
        while responder != nil {
            if let app = responder as? UIApplication {
                app.perform(#selector(openURL(_:)), with: url)
                return
            }
            responder = responder?.next
        }
    }

    private func completeRequest() {
        self.extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
    }
}
