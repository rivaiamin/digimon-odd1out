<script lang="ts">
	import { T } from '@threlte/core';
	import { Stars, Float } from '@threlte/extras';
	import { COLORS } from '$lib/game/constants';

	const cubes = Array.from({ length: 12 }, (_, i) => ({
		key: i,
		position: [
			(Math.random() - 0.5) * 20,
			(Math.random() - 0.5) * 20,
			(Math.random() - 0.5) * 10 - 10
		] as const
	}));
</script>

<T.Color attach="background" args={[COLORS.arenaBackground]} />
<Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

<T.AmbientLight intensity={1.0} />
<T.PointLight position={[10, 10, 10]} intensity={2} color={COLORS.digitalCyan} />
<T.PointLight position={[-10, -10, -10]} intensity={1.5} color={COLORS.digitalPink} />

<T.Group>
	{#each cubes as cube (cube.key)}
		<Float speed={2} rotationIntensity={1} floatIntensity={1}>
			<T.Mesh position={cube.position}>
				<T.BoxGeometry args={[0.5, 0.5, 0.5]} />
				<T.MeshStandardMaterial
					color="#0044ff"
					transparent
					opacity={0.2}
					metalness={0.4}
					roughness={0.15}
				/>
			</T.Mesh>
		</Float>
	{/each}
</T.Group>
