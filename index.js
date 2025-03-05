// Add these imports to work with Lucide icons
const { CheckCircle, Home } = window.lucideReact;

// Changed component name to PlasticEliminatorApp to match what's being rendered
const PlasticEliminatorApp = () => {
  // States for the interactive demo
  const [currentView, setCurrentView] = React.useState('home');
  const [completedToday, setCompletedToday] = React.useState(false);
  const [exportSuccess, setExportSuccess] = React.useState(false);
  
  // Sample data
  const eliminatedPlastics = [
    { id: 1, text: 'Stopped using plastic water bottle', date: '2/27/25' },
    { id: 2, text: 'Brought reusable shopping bags', date: '2/26/25' },
    { id: 3, text: 'Used bar soap instead of bottled', date: '2/25/25' }
  ];
  
  const targets = [
    { id: 4, text: 'Skip plastic straws', date: '2/24/25' }
  ];
  
  // Mark today's suggestion as completed
  const markAsEliminated = () => {
    setCompletedToday(true);
  };
  
  // Simulate export functionality
  const exportAccomplishments = () => {
    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
    }, 3000);
  };
  
  // Navigation bar
  const renderNavBar = () => (
    <div className="bg-white py-4 border-b border-gray-200">
      <div className="flex justify-between items-center px-4">
        <h1 
          onClick={() => setCurrentView('home')}
          className="text-2xl font-bold text-red-700 cursor-pointer hover:text-red-800 transition-colors"
        >
          Plastic Eliminator
        </h1>
        <div className="flex space-x-6">
          <button 
            onClick={() => setCurrentView('eliminated')} 
            className={`text-${currentView === 'eliminated' ? 'red-700' : 'gray-500'}`}
          >
            eliminated
          </button>
          <button 
            onClick={() => setCurrentView('targets')} 
            className={`text-${currentView === 'targets' ? 'red-700' : 'gray-500'}`}
          >
            targets
          </button>
        </div>
      </div>
    </div>
  );
  
  // Rest of your code remains the same...
  // Home view
  const renderHomeView = () => (
    <div className="flex flex-col items-center px-4 py-8">
      <h2 className="text-3xl font-bold text-red-700 mb-8">TODAY</h2>
      
      {completedToday ? (
        <>
          <p className="text-xl text-center mb-8">Come back tomorrow to find more plastic to eliminate</p>
          <CheckCircle className="mx-auto text-green-500" size={64} />
        </>
      ) : (
        <>
          <p className="text-xl text-center mb-8">Use a reusable water bottle</p>
          
          <button
            onClick={markAsEliminated}
            className="mt-4 px-6 py-3 rounded border border-red-600 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition duration-300"
          >
            I eliminated it
          </button>
        </>
      )}
    </div>
  );
  
  // Eliminated view
  const renderEliminatedView = () => (
    <div className="px-4 py-8">
      <h2 className="text-3xl font-bold text-red-700 text-center mb-8">PLASTICS I'VE ELIMINATED</h2>
      
      <div className="space-y-6 mb-8">
        {eliminatedPlastics.map((item, index) => (
          <div key={index} className="border-b pb-4">
            <p className="font-bold">{item.date}</p>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
      
      <div className="flex flex-col items-center">
        {exportSuccess ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">Success!</p>
            <p>Your accomplishments have been saved.</p>
          </div>
        ) : null}
        
        <button
          onClick={exportAccomplishments}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Save My Accomplishments
        </button>
      </div>
    </div>
  );
  
  // Targets view
  const renderTargetsView = () => (
    <div className="px-4 py-8">
      <h2 className="text-3xl font-bold text-red-700 text-center mb-8">TARGETS</h2>
      
      <div className="space-y-8">
        {targets.map((target, index) => (
          <div key={index} className="border-b pb-6">
            <p className="text-xl mb-2">Previous task I haven't completed</p>
            <p className="text-gray-600 mb-2">Date: {target.date}</p>
            <p className="mb-4">{target.text}</p>
            
            <button
              className="px-6 py-2 rounded border border-red-600 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition duration-300"
            >
              I eliminated it
            </button>
          </div>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col border border-gray-300 shadow-lg">
      {renderNavBar()}
      
      <div className="flex-grow">
        {currentView === 'home' && renderHomeView()}
        {currentView === 'eliminated' && renderEliminatedView()}
        {currentView === 'targets' && renderTargetsView()}
      </div>
      
      {currentView !== 'home' && (
        <button 
          onClick={() => setCurrentView('home')}
          className="fixed bottom-4 left-4 p-2 bg-white rounded-full shadow-md border border-gray-300"
        >
          <Home size={24} />
        </button>
      )}
    </div>
  );
};

// Use React instead of ReactDOM since we're using the global React
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<PlasticEliminatorApp />);