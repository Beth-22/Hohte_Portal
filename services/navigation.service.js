export class NavigationService {
  constructor() {
    this.routes = {
      home: { path: "/home", name: "home" },
      courses: { path: "/courses", name: "courses" },
      courseDetail: { path: "/courses/:id", name: "courses-id" },
      permissionRequest: {
        path: "/permission/request",
        name: "permission-request",
      },
      permissionStatus: {
        path: "/permission/status",
        name: "permission-status",
      },
      messages: { path: "/messages", name: "messages" },
      alerts: { path: "/alerts", name: "alerts" },
    };
  }

  getRoute(routeName, params = {}) {
    const route = this.routes[routeName];
    if (!route) return "/home";

    let path = route.path;
    Object.keys(params).forEach((key) => {
      path = path.replace(`:${key}`, params[key]);
    });

    return path;
  }

  navigate(router, routeName, params = {}) {
    const path = this.getRoute(routeName, params);
    router.push(path);
  }

  getActiveNav(route) {
    const routeMap = {
      "/": "home",
      "/home": "home",
      "/courses": "courses",
      "/courses/*": "courses",
      "/permission/request": "permission",
      "/permission/status": "status",
      "/messages": "messages",
      "/alerts": "alerts",
    };

    for (const [pattern, nav] of Object.entries(routeMap)) {
      if (
        pattern.endsWith("*") &&
        route.path.startsWith(pattern.slice(0, -1))
      ) {
        return nav;
      }
      if (route.path === pattern) {
        return nav;
      }
    }
    return "home";
  }
}

export const navigationService = new NavigationService();
