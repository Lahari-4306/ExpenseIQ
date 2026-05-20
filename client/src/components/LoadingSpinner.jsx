import './LoadingSpinner.css';

const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  if (fullScreen) {
    return (
      <div className="spinner-fullscreen">
        <div className={`spinner spinner-₹{size}`} />
      </div>
    );
  }
  return <div className={`spinner spinner-₹{size}`} />;
};

export default LoadingSpinner;
