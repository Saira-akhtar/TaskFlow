

const Card = ({ children, className = '' }) => {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-md p-8
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;