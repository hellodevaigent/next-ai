export const LoadingCandle = () => {
  return (
    <div className="flex items-end space-x-2 mb-4">
      <div className="flex flex-col items-center animate-pulse">
        <div className="w-0.5 h-4 bg-green-400 animate-bounce"></div>
        <div className="w-3 h-8 bg-green-500 rounded-sm animate-pulse delay-75"></div>
        <div className="w-0.5 h-3 bg-green-400 animate-bounce delay-150"></div>
      </div>

      <div className="flex flex-col items-center animate-pulse delay-100">
        <div className="w-0.5 h-2 bg-red-400 animate-bounce delay-200"></div>
        <div className="w-3 h-12 bg-red-500 rounded-sm animate-pulse delay-300"></div>
        <div className="w-0.5 h-5 bg-red-400 animate-bounce delay-100"></div>
      </div>

      <div className="flex flex-col items-center animate-pulse delay-200">
        <div className="w-0.5 h-6 bg-green-400 animate-bounce delay-300"></div>
        <div className="w-3 h-6 bg-green-500 rounded-sm animate-pulse delay-150"></div>
        <div className="w-0.5 h-2 bg-green-400 animate-bounce delay-75"></div>
      </div>

      <div className="flex flex-col items-center animate-pulse delay-300">
        <div className="w-0.5 h-3 bg-red-400 animate-bounce delay-100"></div>
        <div className="w-3 h-10 bg-red-500 rounded-sm animate-pulse delay-200"></div>
        <div className="w-0.5 h-4 bg-red-400 animate-bounce delay-300"></div>
      </div>

      <div className="flex flex-col items-center animate-pulse delay-500">
        <div className="w-0.5 h-5 bg-green-400 animate-bounce delay-200"></div>
        <div className="w-3 h-14 bg-green-500 rounded-sm animate-pulse delay-100"></div>
        <div className="w-0.5 h-3 bg-green-400 animate-bounce delay-400"></div>
      </div>

      <div className="flex flex-col items-center animate-pulse delay-700">
        <div className="w-0.5 h-2 bg-red-400 animate-bounce delay-500"></div>
        <div className="w-3 h-7 bg-red-500 rounded-sm animate-pulse delay-300"></div>
        <div className="w-0.5 h-6 bg-red-400 animate-bounce delay-150"></div>
      </div>
    </div>
  );
};

export const LoadingBars = () => {
  return (
    <div className="flex items-end space-x-1 mb-4">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={`w-4 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm animate-pulse`}
          style={{
            height: `${Math.random() * 40 + 20}px`,
            animationDelay: `${i * 100}ms`
          }}
        />
      ))}
    </div>
  );
};

export const LoadingWaves = () => {
  return (
    <div className="flex items-center space-x-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-2 h-8 bg-blue-500 rounded-full animate-bounce"
          style={{
            animationDelay: `${i * 200}ms`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

export const LoadingPulse = () => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 bg-indigo-500 rounded-full animate-ping"
          style={{
            animationDelay: `${i * 300}ms`
          }}
        />
      ))}
    </div>
  );
};

export const LoadingDots = () => {
  return (
    <div className="flex items-center space-x-1 mb-4">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
      </div>
      <span className="text-gray-500 ml-2">Loading...</span>
    </div>
  );
};

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center mb-4">
      <div className="relative">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-red-500 rounded-full animate-spin animate-reverse"></div>
      </div>
    </div>
  );
};

export const LoadingBlocks = () => {
  return (
    <div className="grid grid-cols-3 gap-1 w-12 h-12 mb-4">
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 bg-yellow-500 rounded animate-pulse"
          style={{
            animationDelay: `${i * 100}ms`
          }}
        />
      ))}
    </div>
  );
};

export const LoadingWaveform = () => {
  const bars = Array.from({ length: 12 }, (_, i) => i);
  
  return (
    <div className="flex items-center justify-center space-x-1 h-16 mb-4">
      {bars.map((bar) => (
        <div
          key={bar}
          className="w-1 bg-gradient-to-t from-green-400 to-green-600 rounded-full animate-pulse"
          style={{
            height: `${Math.sin(bar * 0.5) * 20 + 30}px`,
            animationDelay: `${bar * 150}ms`,
            animationDuration: '1.5s'
          }}
        />
      ))}
    </div>
  );
};

export const LoadingMatrix = () => {
  const cells = Array.from({ length: 25 }, (_, i) => i);
  
  return (
    <div className="grid grid-cols-5 gap-1 w-20 h-20 mb-4">
      {cells.map((cell) => (
        <div
          key={cell}
          className="w-3 h-3 bg-cyan-500 rounded animate-ping"
          style={{
            animationDelay: `${(cell % 5) * 200 + Math.floor(cell / 5) * 100}ms`,
            animationDuration: '2s'
          }}
        />
      ))}
    </div>
  );
};

export const LoaderScreen = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-background-primary">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-5 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
      </div>
    </div>
  );
}