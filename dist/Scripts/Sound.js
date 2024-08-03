export class Sound {
    constructor(scene, name, type = "mp3") {
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
