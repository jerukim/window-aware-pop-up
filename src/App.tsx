import { Popup } from './components/PopUp'

export default function App() {
  return (
    <div className="w-[200vw] h-[200vh] grid grid-cols-2 place-items-center">
      <Popup offset={28} />
      <Popup offset={0} />
      <Popup offset={16} />
      <Popup offset={16} />
      <Popup offset={16} />
      <Popup offset={16} />
    </div>
  )
}
