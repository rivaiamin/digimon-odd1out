# PRD: Digi-Odd One Out

## 1. Product Overview
**Digi-Odd One Out** is an interactive, 3D-powered web puzzle game where players test their knowledge of Digimon lore. The game challenges players to identify the "Odd One Out" from a set of four Digimon cards based on specific relational data points such as Attributes, Levels, Types, and Fields.

## 2. Target Audience
- Digimon fans and enthusiasts.
- Casual puzzle game players.
- Users interested in digital-themed, interactive web experiences.

## 3. Core Features

### 3.1. Puzzle Generation
- **Dynamic Categories:** Puzzles are generated based on four main Digimon properties:
    - **Attribute** (e.g., Vaccine, Data, Virus)
    - **Digivolution Level** (e.g., Rookie, Champion, Ultimate)
    - **Type** (e.g., Beast, Dragon, Angel)
    - **Field** (e.g., Nature Spirits, Metal Empire)
- **Constraint-Based Selection:** Each puzzle presents 4 cards:
    - 3 cards share a common value in a randomly selected category.
    - 1 card (the "Odd One Out") has a different value in that same category.

### 3.2. Gameplay Mechanics
- **Lives System:** Players start with 3 lives.
- **Scoring:** Points are awarded for each correct guess (e.g., 100 points).
- **Game Phases:**
    - **Dealing:** Cards are "dealt" into the 3D scene.
    - **Guessing:** Player inspects cards and hints to make a selection.
    - **Revealing:** The result is shown, along with a detailed explanation of the connection and the anomaly.
    - **Game Over:** Triggered when lives reach zero.

### 3.3. 3D User Interface
- **Interactive Arena:** A floating 3D environment using React Three Fiber.
- **Card Interaction:** 3D card models that can be hovered, selected, and flipped.
- **Visual Feedback:** Hover highlights, selection glows, and status-based animations.

### 3.4. Aesthetics and "Vibe"
- **Theme:** Cyberpunk / Digital World / "Matrix" aesthetic.
- **Visual Elements:**
    - Scanlines and digital grids.
    - High-contrast colors (Digital Cyan, Digital Pink).
    - Italicized, heavy typography (Swiss-style display fonts).
    - Floating background elements (GLTF network cubes, glowing orbs).

## 4. Technical Architecture

### 4.1. Technology Stack
- **Framework:** React 18+ with Vite.
- **3D Engine:** Three.js via React Three Fiber (@react-three/fiber) and @react-three/drei.
- **Styling:** Tailwind CSS.
- **Animations:** framer-motion (motion for React).
- **Icons:** Lucide React.
- **Backend:** Express.js (Full-stack setup).
- **Database:** SQLite (`better-sqlite3`).

### 4.2. Data Management
- **External Integration:** Data is sourced from the official [Digi-API](https://digi-api.com).
- **Local Persistence:** The application maintains a local SQLite database (`digimon.db`) to cache Digimon data (ID, Name, Image, Level, Attribute, Type, Field).
- **Background Sync:** The server automatically syncs data for the first 1400 Digimon to ensure low-latency puzzle generation.

### 4.3. API Endpoints
- `GET /api/puzzle`: Returns a structured puzzle object containing:
    - `cards`: Array of 4 cards with names, hints, and image URLs.
    - `answer_index`: The index (0-3) of the correct answer.
    - `connection`: A short description of what the 3 similar cards share.
    - `explanation`: A detailed explanation for the results screen.

## 5. User Flow
1. User enters the app.
2. Server checks if data sync is complete (or sufficiently populated).
3. First puzzle is generated and "dealt" in 3D.
4. User examines the "Lore Hints" on the back of the cards or the visual attributes.
5. User clicks a card to guess.
6. The system reveals if the guess was correct.
7. User continues to the next round or restarts upon "Network Collapse" (Game Over).

## 6. Success Metrics
- Average score per session.
- User retention (replaying after Game Over).
- Correct guess accuracy rate across different categories.
