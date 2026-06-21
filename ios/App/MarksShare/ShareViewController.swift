//
//  ShareViewController.swift — Marks Share Extension
//
//  Copies the shared URL + title to the system pasteboard wrapped in a
//  marker the Marks app recognises ("MARKS::<url>::<title>"). The user
//  then taps Marks; on foreground the app reads the pasteboard, detects
//  the marker, and pops the Add Bookmark dialog pre-filled.
//
//  This approach avoids App Groups / dev-team capability requirements
//  while still passing data Extension → app reliably.
//

import UIKit
import Social
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor.black.withAlphaComponent(0.4)
        extractAndStash()
    }

    private func extractAndStash() {
        guard let extensionContext = self.extensionContext,
              let item = extensionContext.inputItems.first as? NSExtensionItem,
              let attachments = item.attachments else {
            completeRequest()
            return
        }

        let title = item.attributedContentText?.string ?? ""

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
            guard let url = sharedURL else {
                self.completeRequest()
                return
            }
            let payload = "MARKS::\(url)::\(title)"
            UIPasteboard.general.string = payload
            self.showSuccessThenClose()
        }
    }

    private func showSuccessThenClose() {
        let alert = UIAlertController(
            title: "Ready to save",
            message: "Open Marks to add this page.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
            self.completeRequest()
        })
        present(alert, animated: true)
    }

    private func completeRequest() {
        extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
    }
}
