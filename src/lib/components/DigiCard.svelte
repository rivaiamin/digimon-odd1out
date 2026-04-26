<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Text, useTexture } from '@threlte/extras';
	import * as THREE from 'three';

	let {
		position,
		name,
		image,
		isFlipped,
		isSelected,
		isCorrect = false,
		isRevealed = false,
		onClick
	} = $props<{
		position: [number, number, number];
		name: string;
		image: string;
		isFlipped: boolean;
		isSelected: boolean;
		isCorrect?: boolean;
		isRevealed?: boolean;
		onClick: () => void;
	}>();

	const cardWidth = 2.4;
	const cardHeight = 3.4;

	let group = $state<THREE.Group | null>(null);
	let hovered = $state(false);

	// `useTexture` returns an AsyncWritable store (not a Texture).
	// Passing the store object into a material can yield shader defines like `uvundefined`.
	let texture = $state<THREE.Texture | null>(null);
	$effect(() => {
		if (!image) {
			texture = null;
			return;
		}

		const textureStore = useTexture(image);
		const unsubscribe = textureStore.subscribe((t: THREE.Texture | null | undefined) => {
			texture = t ?? null;
		});

		return unsubscribe;
	});

	let rot = $state({ x: 0, y: Math.PI });
	let zLift = $state(0);
	let animT = 0;

	function borderColor() {
		if (isRevealed) return isCorrect ? '#00f2ff' : '#ff007a';
		return isSelected ? '#ff9d00' : 'rgba(0, 242, 255, 0.4)';
	}

	useTask((delta: number) => {
		animT += delta;

		const targetY = isFlipped ? 0 : Math.PI;
		const targetZ = isSelected ? 0.5 : 0;

		zLift = THREE.MathUtils.lerp(zLift, targetZ + (hovered ? 0.2 : 0), 0.12);
		rot.y = THREE.MathUtils.lerp(rot.y, targetY, 0.12);

		// Approximate the React parallax tilt
		const tiltX = hovered && isFlipped ? -Math.sin(animT * 1.6) * 0.06 : 0;
		const tiltY = hovered && isFlipped ? Math.sin(animT * 1.2) * 0.08 : 0;
		rot.x = THREE.MathUtils.lerp(rot.x, tiltX, 0.12);

		if (group) {
			group.rotation.x = rot.x;
			group.rotation.y = rot.y + tiltY;
			group.position.z = zLift;
		}
	});
</script>

<T.Group
	bind:ref={group}
	{position}
	onpointerenter={() => (hovered = true)}
	onpointerleave={() => (hovered = false)}
	onpointerdown={(e: import('@threlte/extras').IntersectionEvent<PointerEvent>) => {
		// Prevent OrbitControls (DOM listeners) from stealing the gesture.
		e.stopImmediatePropagation();
		e.stopPropagation();
		onClick();
	}}
>
	<T.Group>
		<T.Mesh>
			<T.PlaneGeometry args={[cardWidth, cardHeight]} />
			<T.MeshStandardMaterial
				color={borderColor()}
				metalness={0.9}
				roughness={0.1}
				transparent
				opacity={isRevealed && !isCorrect ? 0.2 : 0.8}
				emissive={borderColor()}
				emissiveIntensity={isSelected || (isRevealed && isCorrect) ? 1.5 : 0.2}
			/>
		</T.Mesh>

		<T.Mesh position={[0, 0, 0.01]}>
			<T.PlaneGeometry args={[cardWidth * 0.92, cardHeight * 0.92]} />
			<T.MeshStandardMaterial color="#0a0f19" opacity={0.9} transparent />
		</T.Mesh>

		<T.Mesh position={[0, 0.4, 0.02]}>
			<T.PlaneGeometry args={[cardWidth * 0.85, cardHeight * 0.55]} />
			<T.MeshStandardMaterial color="#1a1c2c" emissive="#0044ff" emissiveIntensity={0.1} />
		</T.Mesh>

		<T.Mesh position={[0, 0.4, 0.021]}>
			<T.PlaneGeometry args={[cardWidth * 0.85, cardHeight * 0.55]} />
			<T.MeshStandardMaterial color="#00f2ff" transparent opacity={0.05} wireframe />
		</T.Mesh>

		{#if texture}
			<T.Mesh position={[0, 0.4, 0.05]}>
				<T.PlaneGeometry args={[cardWidth * 0.75, cardHeight * 0.5]} />
				<T.MeshStandardMaterial
					map={texture}
					transparent
					opacity={isRevealed && !isCorrect ? 0.2 : 1}
					metalness={0.0}
					roughness={1.0}
				/>
			</T.Mesh>
		{/if}

		<Text
			position={[-0.7, -0.6, 0.05]}
			fontSize={0.22}
			color={isSelected ? '#ff9d00' : 'white'}
			maxWidth={cardWidth * 0.8}
			textAlign="center"
			anchorY="middle"
			text={name.toUpperCase()}
		/>

		<T.Group position={[0, -1.1, 0.05]}>
			<Text
				position={[-0.5, 0, 0]}
				fontSize={0.08}
				color="#00f2ff"
				anchorX="center"
				text="[ TYPE_V1 ]"
			/>
			<Text
				position={[0.5, 0, 0]}
				fontSize={0.08}
				color="#00f2ff"
				anchorX="center"
				text="[ NODE_STABLE ]"
			/>
		</T.Group>
	</T.Group>

	<T.Group rotation={[0, Math.PI, 0]}>
		<T.Mesh position={[0, 0, 0.02]}>
			<T.PlaneGeometry args={[cardWidth, cardHeight]} />
			<T.MeshStandardMaterial color="#0a0f19" />
		</T.Mesh>
		<Text
			position={[0, 0, 0.03]}
			fontSize={0.2}
			color="#00f2ff"
			maxWidth={cardWidth * 0.8}
			textAlign="center"
			text="ANALYZING\nDIGITAL\nSIGNATURE"
		/>
	</T.Group>
</T.Group>
