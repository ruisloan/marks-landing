import UIKit
import WebKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Check the pasteboard for a Marks share payload coming from the
        // Share Extension. Pattern: "MARKS::<url>::<title>"
        checkMarksPasteboard()
    }

    private func checkMarksPasteboard() {
        guard UIPasteboard.general.hasStrings,
              let value = UIPasteboard.general.string,
              value.hasPrefix("MARKS::") else { return }
        let parts = value.dropFirst("MARKS::".count).components(separatedBy: "::")
        let url = parts.first ?? ""
        let title = parts.count > 1 ? parts[1] : ""
        guard !url.isEmpty else { return }
        UIPasteboard.general.string = ""  // consume so we don't re-fire on every foreground

        // Inject a JS event into the Capacitor webview after the page is ready.
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            guard let webView = self.findCapacitorWebView() else { return }
            let escapedURL = url.replacingOccurrences(of: "\\", with: "\\\\")
                                .replacingOccurrences(of: "'", with: "\\'")
            let escapedTitle = title.replacingOccurrences(of: "\\", with: "\\\\")
                                    .replacingOccurrences(of: "'", with: "\\'")
            let js = """
                window.dispatchEvent(new CustomEvent('marks:share', { detail: { url: '\(escapedURL)', title: '\(escapedTitle)' } }));
            """
            webView.evaluateJavaScript(js, completionHandler: nil)
        }
    }

    private func findCapacitorWebView() -> WKWebView? {
        guard let window = self.window,
              let rootVC = window.rootViewController else { return nil }
        return Self.findWebView(in: rootVC.view)
    }

    private static func findWebView(in view: UIView) -> WKWebView? {
        if let wk = view as? WKWebView { return wk }
        for subview in view.subviews {
            if let found = findWebView(in: subview) { return found }
        }
        return nil
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
