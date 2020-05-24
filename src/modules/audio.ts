export class Audio extends Entity {
  constructor(audio: AudioClip) {
    super()
    engine.addEntity(this)
    this.addComponent(new Transform())
    this.getComponent(Transform).position = Camera.instance.position
    this.addComponent(new AudioSource(audio))
  }
}

