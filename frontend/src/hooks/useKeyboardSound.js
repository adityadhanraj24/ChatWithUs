const keyStrokeSound = [
    new Audio("/Sounds/keystroke1.mp3"),
    new Audio("/Sounds/keystroke2.mp3"),
    new Audio("/Sounds/keystroke3.mp3"),
    new Audio("/Sounds/keystroke4.mp3"),
    new Audio("/Sounds/mouseclick.mp3"),
];

function useKeyboardSound() {
    const playRandomKeyStrokeSound = () => {
        const randomIndex = Math.floor(Math.random() * keyStrokeSound.length);
        const randomSound = keyStrokeSound[randomIndex];

        randomSound.currentTime = 0;
        randomSound.play().catch((error) => {
            console.log("Audio Play Failed :", error);
        });
    };

    return { playRandomKeyStrokeSound };

}
export default useKeyboardSound;
