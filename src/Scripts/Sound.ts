import MainScene from "../Scenes/MainScene.js";

export class Sound{
    private scene: MainScene;
    private soundObject!: Phaser.Sound.BaseSound;
    private name: string;
    private type: string;

	constructor(scene: MainScene, name: string, type: string = "mp3") {
        this.name = name;
        this.type = type;
        this.scene = scene;
    }
    load() {
		this.scene.load.audio(this.name, `./Assets/sounds/${this.name}.${this.type}`);
    }

    create() {
        this.soundObject = this.scene.sound.add(this.name);
    }

    play() {
        this.soundObject.play();
    }
}