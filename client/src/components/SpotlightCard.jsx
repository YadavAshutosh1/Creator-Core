import { useRef } from "react";
import "./SpotlightCard.css";

const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(255, 255, 255, 0.05)", spotlightSize = 250, ...rest }) => {
  const divRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;

    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty("--mouse-x", `${x}px`);
    divRef.current.style.setProperty("--mouse-y", `${y}px`);
    divRef.current.style.setProperty("--spotlight-color", spotlightColor);
    divRef.current.style.setProperty("--spotlight-size", `${spotlightSize}px`);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`spotlight-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default SpotlightCard;
