import React from 'react';

const subfaseToProgress = {
  1.1: 4,  1.2: 8,  1.3: 12,
  2.1: 16, 2.2: 19, 2.3: 22, 2.4: 26,
  2.5: 30, 2.6: 33, 2.7: 36, 2.8: 38,
  3.1: 42, 3.2: 48, 3.3: 52,
  3.4: 56, 3.5: 59, 3.6: 62,
  4.1: 65, 4.2: 68, 4.3: 72, 4.4: 75,
  4.5: 78, 4.6: 81, 4.7: 84, 4.8: 85,
  5.1: 89, 5.2: 93, 5.3: 96,
  6.1: 98, 6.2: 100,
};

export default React.memo(function TemperatureBar({ subfase, showLabel = true }) {
  const progress = subfaseToProgress[subfase] || 0;

  return (
    <div className="temperature-bar-container">
      <div className="temperature-bar-track">
        <div 
          className="temperature-bar-fill"
          style={{ width: `${progress}%` }}
        />
        <div 
          className="temperature-bar-marker"
          style={{ left: `${progress}%` }}
        >
          <div className="temperature-bar-marker-dot" />
        </div>
      </div>
      {showLabel && (
        <div className="temperature-bar-labels">
          <span style={{ color: 'var(--temp-frost-text)', fontSize: '9px', fontWeight: 700 }}>F1</span>
          <span style={{ color: 'var(--temp-cold-text)', fontSize: '9px', fontWeight: 700 }}>F2</span>
          <span style={{ color: 'var(--temp-warm-text)', fontSize: '9px', fontWeight: 700 }}>F3</span>
          <span style={{ color: 'var(--temp-hot-text)', fontSize: '9px', fontWeight: 700 }}>F4</span>
          <span style={{ color: 'var(--temp-fire-text)', fontSize: '9px', fontWeight: 700 }}>F5</span>
          <span style={{ color: 'var(--temp-blaze-text)', fontSize: '9px', fontWeight: 700 }}>F6</span>
        </div>
      )}
    </div>
  );
});


//forma mas limpia
// function TemperatureBar({ subfase, showLabel = true }) {
//   const progress = subfaseToProgress[subfase] || 0;

//   return (
//     <div className="temperature-bar-container">
//       <div className="temperature-bar-track">
//         <div 
//           className="temperature-bar-fill"
//           style={{ width: `${progress}%` }}
//         />
//         <div 
//           className="temperature-bar-marker"
//           style={{ left: `${progress}%` }}
//         >
//           <div className="temperature-bar-marker-dot" />
//         </div>
//       </div>
//       {showLabel && (
//         <div className="temperature-bar-labels">
//           <span style={{ color: 'var(--temp-frost-text)', fontSize: '9px', fontWeight: 700 }}>F1</span>
//           <span style={{ color: 'var(--temp-cold-text)', fontSize: '9px', fontWeight: 700 }}>F2</span>
//           <span style={{ color: 'var(--temp-warm-text)', fontSize: '9px', fontWeight: 700 }}>F3</span>
//           <span style={{ color: 'var(--temp-hot-text)', fontSize: '9px', fontWeight: 700 }}>F4</span>
//           <span style={{ color: 'var(--temp-fire-text)', fontSize: '9px', fontWeight: 700 }}>F5</span>
//           <span style={{ color: 'var(--temp-blaze-text)', fontSize: '9px', fontWeight: 700 }}>F6</span>
//         </div>
//       )}
//     </div>
//   );
// };

// export default React.memo(TemperatureBar);