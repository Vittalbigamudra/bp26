
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/about" | "/admin" | "/api" | "/api/admin" | "/api/admin/approve" | "/api/admin/pending" | "/api/admin/reject" | "/api/buses" | "/api/buses/live" | "/api/buses/status" | "/api/buses/[id]" | "/api/buses/[id]/details" | "/api/buses/[id]/route" | "/api/contact" | "/api/login" | "/api/schools" | "/api/signup" | "/api/sysadmin" | "/api/sysadmin/messages" | "/api/verify" | "/api/[id]" | "/api/[id]/details" | "/api/[id]/routes" | "/contact" | "/gps" | "/login" | "/signup" | "/sysadmin" | "/verify";
		RouteParams(): {
			"/api/buses/[id]": { id: string };
			"/api/buses/[id]/details": { id: string };
			"/api/buses/[id]/route": { id: string };
			"/api/[id]": { id: string };
			"/api/[id]/details": { id: string };
			"/api/[id]/routes": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/about": Record<string, never>;
			"/admin": Record<string, never>;
			"/api": { id?: string };
			"/api/admin": Record<string, never>;
			"/api/admin/approve": Record<string, never>;
			"/api/admin/pending": Record<string, never>;
			"/api/admin/reject": Record<string, never>;
			"/api/buses": { id?: string };
			"/api/buses/live": Record<string, never>;
			"/api/buses/status": Record<string, never>;
			"/api/buses/[id]": { id: string };
			"/api/buses/[id]/details": { id: string };
			"/api/buses/[id]/route": { id: string };
			"/api/contact": Record<string, never>;
			"/api/login": Record<string, never>;
			"/api/schools": Record<string, never>;
			"/api/signup": Record<string, never>;
			"/api/sysadmin": Record<string, never>;
			"/api/sysadmin/messages": Record<string, never>;
			"/api/verify": Record<string, never>;
			"/api/[id]": { id: string };
			"/api/[id]/details": { id: string };
			"/api/[id]/routes": { id: string };
			"/contact": Record<string, never>;
			"/gps": Record<string, never>;
			"/login": Record<string, never>;
			"/signup": Record<string, never>;
			"/sysadmin": Record<string, never>;
			"/verify": Record<string, never>
		};
		Pathname(): "/" | "/about" | "/admin" | "/api/admin/approve" | "/api/admin/pending" | "/api/admin/reject" | "/api/buses/live" | "/api/buses/status" | `/api/buses/${string}/details` & {} | `/api/buses/${string}/route` & {} | "/api/contact" | "/api/login" | "/api/schools" | "/api/signup" | "/api/sysadmin/messages" | "/api/verify" | `/api/${string}/details` & {} | `/api/${string}/routes` & {} | "/contact" | "/gps" | "/login" | "/signup" | "/sysadmin" | "/verify";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/robots.txt" | string & {};
	}
}