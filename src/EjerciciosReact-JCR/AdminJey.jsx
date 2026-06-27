export default function AdminJey() {
    return (
        <div>
            <style>{`
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background-color: #1a1a2e;
                    font-family: Arial, sans-serif;
                }

                .container {
                    text-align: center;
                }

                h1 {
                    color: #ffffff;
                    margin-bottom: 30px;
                    font-size: 24px;
                }

                .temperature-bar {
                    display: flex;
                    flex-direction: row;
                    gap: 0;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                }

                .color-box {
                    width: 28px;
                    height: 60px;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    font-size: 9px;
                    color: rgba(255, 255, 255, 0.7);
                    padding-bottom: 4px;
                    transition: transform 0.2s ease;
                }

                .color-box:hover {
                    transform: scaleY(1.3);
                    z-index: 10;
                }

                .labels {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: bold;
                }

                .label-cold {
                    color: #00BFFF;
                }

                .label-hot {
                    color: #FF4500;
                }
            `}</style>

            <div className="container">
                <h1>🌡️ Barra de Temperatura</h1>
                <div className="temperature-bar">
                    {/* AZUL FRÍO (11) */}
                    <div className="color-box" style={{ backgroundColor: '#0000FF' }} title="#0000FF"></div>
                    <div className="color-box" style={{ backgroundColor: '#001BFF' }} title="#001BFF"></div>
                    <div className="color-box" style={{ backgroundColor: '#003EFF' }} title="#003EFF"></div>
                    <div className="color-box" style={{ backgroundColor: '#0059FF' }} title="#0059FF"></div>
                    <div className="color-box" style={{ backgroundColor: '#0062FF' }} title="#0062FF"></div>
                    <div className="color-box" style={{ backgroundColor: '#0073FF' }} title="#0073FF"></div>
                    <div className="color-box" style={{ backgroundColor: '#008EFF' }} title="#008EFF"></div>
                    <div className="color-box" style={{ backgroundColor: '#00A9FF' }} title="#00A9FF"></div>
                    <div className="color-box" style={{ backgroundColor: '#00C3FF' }} title="#00C3FF"></div>
                    <div className="color-box" style={{ backgroundColor: '#00DEFF' }} title="#00DEFF"></div>
                    <div className="color-box" style={{ backgroundColor: '#00F8FF' }} title="#00F8FF"></div>
                    {/* CIAN / TURQUESA (8) */}
                    <div className="color-box" style={{ backgroundColor: '#00FFFD' }} title="#00FFFD"></div>
                    <div className="color-box" style={{ backgroundColor: '#00FFE2' }} title="#00FFE2"></div>
                    <div className="color-box" style={{ backgroundColor: '#00FFD0' }} title="#00FFD0"></div>
                    <div className="color-box" style={{ backgroundColor: '#00FFBF' }} title="#00FFBF"></div>
                    <div className="color-box" style={{ backgroundColor: '#00FFA4' }} title="#00FFA4"></div>
                    <div className="color-box" style={{ backgroundColor: '#00FF92' }} title="#00FF92"></div>
                    <div className="color-box" style={{ backgroundColor: '#00FF81' }} title="#00FF81"></div>
                    <div className="color-box" style={{ backgroundColor: '#00FF6F' }} title="#00FF6F"></div>
                    {/* VERDE (17) */}
                    <div className="color-box" style={{ backgroundColor: '#00FF54' }} title="#00FF54"></div>
                    <div className="color-box" style={{ backgroundColor: '#00FF43' }} title="#00FF43"></div>
                    <div className="color-box" style={{ backgroundColor: '#00FF31' }} title="#00FF31"></div>
                    <div className="color-box" style={{ backgroundColor: '#00FF16' }} title="#00FF16"></div>
                    <div className="color-box" style={{ backgroundColor: '#00FF04' }} title="#00FF04"></div>
                    <div className="color-box" style={{ backgroundColor: '#0DFF00' }} title="#0DFF00"></div>
                    <div className="color-box" style={{ backgroundColor: '#1FFF00' }} title="#1FFF00"></div>
                    <div className="color-box" style={{ backgroundColor: '#3AFF00' }} title="#3AFF00"></div>
                    <div className="color-box" style={{ backgroundColor: '#4BFF00' }} title="#4BFF00"></div>
                    <div className="color-box" style={{ backgroundColor: '#66FF00' }} title="#66FF00"></div>
                    <div className="color-box" style={{ backgroundColor: '#78FF00' }} title="#78FF00"></div>
                    <div className="color-box" style={{ backgroundColor: '#8AFF00' }} title="#8AFF00"></div>
                    <div className="color-box" style={{ backgroundColor: '#A4FF00' }} title="#A4FF00"></div>
                    <div className="color-box" style={{ backgroundColor: '#BFFF00' }} title="#BFFF00"></div>
                    <div className="color-box" style={{ backgroundColor: '#D0FF00' }} title="#D0FF00"></div>
                    <div className="color-box" style={{ backgroundColor: '#EBFF00' }} title="#EBFF00"></div>
                    <div className="color-box" style={{ backgroundColor: '#FDFF00' }} title="#FDFF00"></div>
                    {/* AMARILLO (6) */}
                    <div className="color-box" style={{ backgroundColor: '#FFF800' }} title="#FFF800"></div>
                    <div className="color-box" style={{ backgroundColor: '#FFDE00' }} title="#FFDE00"></div>
                    <div className="color-box" style={{ backgroundColor: '#FFCC00' }} title="#FFCC00"></div>
                    <div className="color-box" style={{ backgroundColor: '#FFBA00' }} title="#FFBA00"></div>
                    <div className="color-box" style={{ backgroundColor: '#FFA900' }} title="#FFA900"></div>
                    <div className="color-box" style={{ backgroundColor: '#FF9700' }} title="#FF9700"></div>
                    {/* NARANJA (7) */}
                    <div className="color-box" style={{ backgroundColor: '#FF8500' }} title="#FF8500"></div>
                    <div className="color-box" style={{ backgroundColor: '#FF7300' }} title="#FF7300"></div>
                    <div className="color-box" style={{ backgroundColor: '#FF5900' }} title="#FF5900"></div>
                    <div className="color-box" style={{ backgroundColor: '#FF4700' }} title="#FF4700"></div>
                    <div className="color-box" style={{ backgroundColor: '#FF3500' }} title="#FF3500"></div>
                    <div className="color-box" style={{ backgroundColor: '#FF2400' }} title="#FF2400"></div>
                    <div className="color-box" style={{ backgroundColor: '#FF1200' }} title="#FF1200"></div>
                    {/* ROJO CALIENTE (1) */}
                    <div className="color-box" style={{ backgroundColor: '#FF0000' }} title="#FF0000"></div>
                </div>
                <div className="labels">
                    <span className="label-cold">❄️ FRÍO</span>
                    <span className="label-hot">🔥 CALIENTE</span>
                </div>
            </div>
        </div>
    );
}
