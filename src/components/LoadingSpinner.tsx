import "../styles/LoadingSpinner.css"

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading movies...</p>
    </div>
  )
}

export default LoadingSpinner
