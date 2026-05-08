// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

interface ImportMetaEnv {
	readonly PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module '@threlte/core' {
	export const Canvas: ComponentType;
	export const T: ComponentType;
	export function useFrame(cb: (time: number) => void): void;
}

declare module '@threlte/extras' {
	export const OrbitControls: ComponentType;
	export const PerspectiveCamera: ComponentType;
	export const Stars: ComponentType;
	export const Float: ComponentType;
	export const Text: ComponentType;
	export function useTexture(url: string): Texture;
}

export {};
