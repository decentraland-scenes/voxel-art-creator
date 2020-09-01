export class Audio extends Entity {
  constructor(audio: AudioClip) {
    super()
    engine.addEntity(this)
    this.addComponent(new Transform())
    this.setParent(Attachable.PLAYER)
    this.addComponent(new AudioSource(audio))
  }
}
