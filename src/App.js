import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.zoom = 1;
    this.state = {
      stop: false,
      scaleWidth: 0,
      scaleHeight: 0,
      width: 800,
      height: 450,
    };
    this.handleZoomIn = this.handleZoomIn.bind(this);
    this.handleZoomOut = this.handleZoomOut.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    this.webcam();
    this.timerID = setInterval(
      () => this.webcamToCanvas(),
      0
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  // read webcam
  webcam() {
    const video = document.getElementById('video');
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
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, this.state.scaleWidth, this.state.scaleHeight, this.state.width, this.state.height);
  }

  // release stream
  releaseStream() {
    const video = document.getElementById('video');
    video.srcObject.getTracks().forEach(function (track) {
      track.stop();
    });
  }

  // handle zoom in
  handleZoomIn() {
    this.zoom += 0.1;
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let width = this.state.width;
    width = width * 1.1;
    let height = this.state.height;
    height = height * 1.1;
    const ratioX = video.videoWidth / width;
    const ratioY = video.videoHeight / height;
    const ratio = Math.min(ratioX, ratioY);
    const scaleWidth = (video.videoWidth - width * ratio) / 2;
    const scaleHeight = (video.videoHeight - height * ratio) / 2;
    this.setState({
      width: width,
      height: height,
      scaleWidth: scaleWidth,
      scaleHeight: scaleHeight,
    })
  }

  // handle zoom out
  handleZoomOut() {
    this.zoom -= 0.1;
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let width = this.state.width;
    width = width * 0.9;
    let height = this.state.height;
    height = height * 0.9;
    this.setState({
      width: width,
      height: height,
    })
  }

  // handle scroll
  handleScroll(e) {
    if (e.deltaY < 0) {
      this.handleZoomIn();
    } else {
      this.handleZoomOut();
    }
  }

  // save image
  saveImage() {
    const canvas = document.getElementById('canvas');
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
        <canvas id='canvas' style={{ display: 'block', width: '800px', height: '100%', margin: 'auto' }} width={1920} height={1080} onWheel={this.handleScroll}></canvas>
        <video id='video' style={{ display: 'none' }} autoPlay={true}></video>
        <div>
          <button type="button" style={{ width: '150px' }} onClick={this.releaseStream}>release stream</button>
        </div>
        <div>
          <button type="button" style={{ width: '100px' }} onClick={this.handleZoomIn}>zoom in</button>
          <button type="button" style={{ width: '100px' }} onClick={this.handleZoomOut}>zoom out</button>
        </div>
        <div>
          <button type="button" style={{ width: '100px' }} onClick={this.saveImage}>save</button>
        </div>
      </div>
    );
  }
}

export default App;
