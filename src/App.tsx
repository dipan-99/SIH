import Viewer from './components/Viewer';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="w-full h-screen flex flex-row bg-gray-900 overflow-hidden">
      <div className="w-3/4 h-full relative">
        <Viewer />
      </div>
      <div className="w-1/4 h-full border-l border-gray-800 shrink-0">
        <Sidebar />
      </div>
    </div>
  );
}

export default App;
