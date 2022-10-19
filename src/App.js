import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.zoom = 1;
    this.state = {
      stop: false,
      scaleWidth: 0,
      scaleHeight: 0,
      width: 800,
      height: 450
    };
    this.canvasTag = React.createRef();
    this.videoTag = React.createRef();
    this.handleZoomIn = this.handleZoomIn.bind(this);
    this.handleZoomOut = this.handleZoomOut.bind(this);
    this.original = this.original.bind(this);
    this.grayscale = this.grayscale.bind(this);
    this.blur = this.blur.bind(this);
    this.saveImage = this.saveImage.bind(this);
  }

  componentDidMount() {
    this.webcam();
    this.callInterval();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.callInterval);
  }

  callInterval() {
    this.webcamToCanvas();
    requestAnimationFrame(() => this.callInterval());
  }

  // read webcam
  webcam() {
    const video = this.videoTag.current;
    const constraints = {
      video: { width: this.state.width, height: this.state.height },
    };

    navigator.mediaDevices.getUserMedia(constraints)
      // handle success
      .then(function (stream) {
        window.stream = stream;
        video.srcObject = stream;
        console.log('Success');
      })
      // handle error
      .catch(function (err) {
        if (err.name === 'ConstraintNotSatisfiedError') {
          alert('The resolution ' + constraints.video.width.exact + 'x' +
            constraints.video.width.exact + ' px is not supported by your device.');
        } else if (err.name === 'PermissionDeniedError') {
          alert('Permissions have not been granted to use your camera and ' +
            'microphone, you need to allow the page access to your devices in ' +
            'order for the demo to work.');
        }
        alert('getUserMedia error: ' + err.name, err);
      });
  }

  // draw webcam to canvas
  webcamToCanvas() {
    const video = this.videoTag.current;
    const canvas = this.canvasTag.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, this.state.scaleWidth, this.state.scaleHeight, this.state.width, this.state.height);
  }

  // release stream
  releaseStream() {
    const video = this.videoTag.current;
    video.srcObject.getVideoTracks().forEach((stream) => {
      stream.stop();
    });
    this.zoom = 1;
    this.setState({
      stop: true,
      scaleWidth: 0,
      scaleHeight: 0,
      width: 800,
      height: 450,
    })
  }

  // handle zoom in
  handleZoomIn() {
    this.zoom += 0.1;
    const video = this.videoTag.current;
    const ratio = this.zoom;
    const scaleWidth = (video.videoWidth - video.videoWidth * ratio) / 2;
    const scaleHeight = (video.videoHeight - video.videoHeight * ratio) / 2;
    this.setState({
      width: video.videoWidth * ratio,
      height: video.videoHeight * ratio,
      scaleWidth: scaleWidth,
      scaleHeight: scaleHeight,
    });
  }

  // handle zoom out
  handleZoomOut() {
    this.zoom -= 0.1;
    if (this.zoom >= 0) {
      const video = this.videoTag.current;
      const ratio = this.zoom;
      const scaleWidth = (video.videoWidth - video.videoWidth * ratio) / 2;
      const scaleHeight = (video.videoHeight - video.videoHeight * ratio) / 2;
      this.setState({
        width: video.videoWidth * ratio,
        height: video.videoHeight * ratio,
        scaleWidth: scaleWidth,
        scaleHeight: scaleHeight,
      })
    } else {
      this.zoom = 0;
    }
  }

  // original
  original() {
    const canvas = this.canvasTag.current;
    canvas.classList.add('original');
    canvas.classList.remove('grayscale');
    canvas.classList.remove('blur');
  }

  // grayscale
  grayscale() {
    const canvas = this.canvasTag.current;
    canvas.classList.add('grayscale');
    canvas.classList.remove('blur');
    canvas.classList.remove('original');
  }

  // blur
  blur() {
    const canvas = this.canvasTag.current;
    canvas.classList.add('blur');
    canvas.classList.remove('grayscale');
    canvas.classList.remove('original');
  }

  // save image
  saveImage() {
    const canvas = this.canvasTag.current;
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'image.png';
    link.href = dataURL;
    link.click();
  }

  // render
  render() {
    return (
      <div className="App" style={{ textAlign: 'center' }}>
        <canvas ref={this.canvasTag} id='canvas' style={{ display: 'block', width: '800px', height: '100%', margin: 'auto' }} width={1920} height={1080}></canvas>
        <video ref={this.videoTag} id='video' style={{ display: 'none' }} autoPlay></video>
        {this.state.stop ?
          <button style={{ width: '150px' }} onClick={
            () => {
              this.setState({
                stop: false
              });
              this.webcam();
              this.timerID = setInterval(() => this.webcamToCanvas(), 0);
            }}>
            create stream
          </button>
          :
          <button style={{ width: '150px' }} onClick={
            () => {
              this.setState({
                stop: true
              });
              this.releaseStream();
              clearInterval(this.timerID);
            }}>
            release stream
          </button>
        }
        {this.state.stop ?
          null
          :
          <div>
            <div>
              <button style={{ width: '100px' }} onClick={this.handleZoomIn}>zoom in</button>
              <button style={{ width: '100px' }} onClick={this.handleZoomOut}>zoom out</button>
            </div>
            <div>
              <button style={{ width: '100px' }} onClick={this.original}>original</button>
              <button style={{ width: '100px' }} onClick={this.grayscale}>grayscale</button>
              <button style={{ width: '100px' }} onClick={this.blur}>blur</button>
            </div>
            <div>
              <button type="button" style={{ width: '100px' }} onClick={this.saveImage}>save</button>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default App;
