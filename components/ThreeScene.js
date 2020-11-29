import React from 'react'
import * as THREE from 'three'
import GLTFLoader from 'three-gltf-loader'

class ThreeScene extends React.Component {
  state = {
    lookAt: {
      x: 0,
      y: 0,
    },
  }

  constructor(props) {
    super(props)

    this.mountRef = React.createRef()
  }

  componentDidMount() {
    this.setupScene()
    window.addEventListener('mousemove', this.mouseHandler)

    this.animateScene()
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.mouseHandler)
  }

  mouseHandler = ({ clientX, clientY }) => {
    const x = (clientX - window.innerWidth) / 2
    const y = (clientY - window.innerHeight) / 2
    // this.camera.updateMatrixWorld()
    // const lookAt = new THREE.Vector3(x, y, -1).unproject(this.camera)

    this.setState({
      lookAt: { x, y },
    })
  }

  setupScene = () => {
    const { width, height } = this.props

    const loader = new GLTFLoader()
    const scene = new THREE.Scene()
    // scene.background = new THREE.Color(0x00000000)
    // ADD CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = 5

    this.createRenderer(width, height)

    scene.add(this.createLight())
    scene.add(this.createHemisphereLight())
    let mesh
    loader.load(
      './static/models/brown_eyeball/scene.gltf',
      ((gltf) => {
        mesh = gltf.scene.children[0]
        // mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -90)
        mesh.castShadow = true
        mesh.receiveShadow = true
        scene.add(mesh)

        this.mesh = mesh
      }).bind(this)
    )

    this.scene = scene
    this.camera = camera
  }

  createRenderer = (width, height) => {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.physicallyCorrectLights = true
    renderer.gammaInput = true
    renderer.gammaOutput = true
    renderer.shadowMap.enabled = true
    renderer.shadowMap.bias = 0.0001
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(width, height)
    this.mountRef.current.appendChild(renderer.domElement)

    this.renderer = renderer
  }

  createLight = () => {
    const lightGeometry = new THREE.SphereGeometry(0)
    const lightMaterial = new THREE.MeshStandardMaterial({
      emissive: 0xffffee,
      emissiveIntensity: 1,
      color: 0x000000,
    })

    const light = new THREE.PointLight(0xffffff, 1, 20, 2)
    light.power = 1700
    light.castShadow = true
    light.shadow.mapSize.width = 512
    light.shadow.mapSize.heigth = 512
    light.shadow.radius = 1.5

    light.add(new THREE.Mesh(lightGeometry, lightMaterial))
    light.position.set(0, 5, 3)

    return light
  }

  createHemisphereLight = () => {
    return new THREE.HemisphereLight(0x303f9f, 0x000000, 1)
  }

  animateScene = () => {
    const { lookAt } = this.state
    window.requestAnimationFrame(this.animateScene)
    let target = new THREE.Vector3()
    target.x += (lookAt.x - target.x) * 0.02
    target.y += -(lookAt.y + target.y) * 0.02

    target.z = this.camera.position.z

    if (!!this.mesh) {
      this.mesh.lookAt(target)
    }
    if (!this.scene || !this.camera) {
      return
    }
    this.renderer.render(this.scene, this.camera)
  }

  render() {
    const { className, width, height, defaultLookAt } = this.props
    return <div className={className} ref={this.mountRef} />
  }
}

// const getLookAtVec = (lookAt, camera) => {
//   return new THREE.Vector3( lookAt.x, lookAt.y, 0 ).unproject( camera )
// }

// const ThreeScene = ({ width, height, className, defaultLookAt }) => {

//   const [init, setInit] = React.useState(false)

//   const [lookAt, setLookAt] = React.useState(null)

//   const mountRef = React.createRef()

//   React.useEffect(() => {

//     if (!init) {
//       setupScene()
//       setInit(true)
//     }

//     const vec = getLookAtVec(defaultLookAt, camera)
//     setLookAt(vec)

//     return () => {}
//   })

//   return (
//     <div className={className} ref={mountRef}/>
//   )
// }

export default ThreeScene
