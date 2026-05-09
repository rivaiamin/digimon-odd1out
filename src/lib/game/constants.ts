export const GAME = {
	startingLives: 3,
	scorePerCorrect: 100,
	// Time-based scoring: award up to this bonus for fast correct picks.
	scoreSpeedBonusMax: 100,
	// Bonus decays linearly to 0 after this time window.
	scoreSpeedWindowMs: 6000,
	dealFlipDelayMs: 1500,
	gameOverDelayMs: 2000
} as const;

export const SCENE = {
	cameraPosition: [0, 0, 8] as const,
	cameraFov: 50,
	cardsGroupPosition: [0, 0.5, 0] as const,
	cardXSpacing: 2.8,
	orbitControls: {
		enableZoom: false,
		enablePan: false,
		maxPolarAngle: Math.PI / 1.8,
		minPolarAngle: Math.PI / 2.2,
		maxAzimuthAngle: Math.PI / 12,
		minAzimuthAngle: -Math.PI / 12
	}
} as const;

export const COLORS = {
	background: '#05070a',
	digitalCyan: '#00f2ff',
	digitalPink: '#ff007a',
	digitalGold: '#ff9d00',
	arenaBackground: '#020617'
} as const;
