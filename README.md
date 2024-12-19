# perfexcrm-app

open ios/app/app/appdelegate.swift and paste this at the bottom

func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
}

func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
}



# Node Js Version Minimum 20

# Java Version Minimum 17

# Global Angular Version 17

# Global Ionic Framework Version 17 