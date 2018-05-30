/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

 /* eslint-disable */

import React from 'react';

import JSZip from 'jszip';
import fileSaver from 'file-saver';
import Template from 'components/Template';
import './styles.css';

// делим на два, потому что у canvas pixel ratio = 2

const widthHD = 1920 / 2;
const heightHD = 1080 / 2;

const width = 1024 / 2;
const height = 576 / 2;

function toBlobAsync(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob));
  });
}

export default class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      lines: [],
      opacity: 0.5,
      light: true,
      rendering: false,
      font: 'Amatic SC'
    };
  }

  componentDidMount() {
    this.getImage('https://source.unsplash.com/1920x1080/?nature,water,forest,city');
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.rendering === false && this.state.rendering === true) {
      this.saveImages();
    }
  }

  generate = () => {
    const images = this.state.lines.map((l, i) => {
      const stage = this.refs[`stage${i}`];
      console.log(stage);
      return stage.toDataUrl();
    });
    this.setState({
      images,
    });
  }

  save = () => {
    if (!this.state.lines.length) return;
    this.setState((prevState) => ({
      ...prevState,
      rendering: true,
    }));
  }

  async saveImages() {
    const zip = new JSZip();
    const canvases = Object.values(document.getElementsByClassName('konvajs-content')).map((el) => el.childNodes[0]);
    const blobs = await Promise.all(canvases.map((canvas) => toBlobAsync(canvas)));
    blobs.map((blob, i) => { //eslint-disable-line
      zip.file(`${i}.png`, blob);
    });
    const archive = await zip.generateAsync({ type: 'blob' });
    fileSaver.saveAs(archive, 'memes.zip');
    this.setState({
      rendering: false,
    });
  }

  getImage(link) {
    const imageObj = new Image();
    imageObj.crossOrigin = 'Anonymous';
    imageObj.src = `http://cors.pmmlabs.ru/${link}`;
    imageObj.onload = () => {
      this.setState({
        imageObj,
      });
    };
  }

  handleInputChange = (event) => {
    console.log(event.target.name, event.target.checked);
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    if (name === 'lines') {
      this.setState({
        text: event.target.value,
        lines: event.target.value.replace(/\r\n/g, '\r').replace(/\n/g, '\r').split(/\r/).filter((l) => !!l),
      });
    } else {
      this.setState({
        [name]: value,
      });
    }
  }

  handleOpacityChange = (e) => {
    this.setState({
      opacity: e.target.value,
    });
  }

  handleLinkChange = (e) => {
    this.setState({
      imageLink: e.target.value,
    });
    if (!e.target.value) return;
    this.getImage(e.target.value);
  }

  render() {
    const { text, lines, imageLink, imageObj, opacity, light, rendering, font } = this.state;
    return (
      <div>
        <textarea onChange={this.handleInputChange} name="lines" placeholder="Надписи по одной на строку" value={text} className="input" />
        <div className="container container-inline">
          <input name="imageLink" value={imageLink} onChange={this.handleLinkChange} type="url" className="textInput" placeholder="Ссылка на фоновое изображение, например с unsplash.com" />
          <button onClick={this.save} className="button">Сгенерировать {lines.length ? `${lines.length} шт.` : ''}</button>
        </div>
        <div className="container container-inline">
          <label style={{fontFamily: "Amatic SC"}} className="checkbox--container">
            <input name="font" onChange={this.handleInputChange} value={'Amatic SC'} checked={font === 'Amatic SC'} type="radio" />
            <div className="checkmark">Amatic SC</div>
          </label>
          <label style={{fontFamily: "PT Sans Caption"}} className="checkbox--container">
            <input name="font" onChange={this.handleInputChange} value={'PT Sans Caption'} checked={font === 'PT Sans Caption' } type="radio" />
            <div className="checkmark">PT Sans Caption</div>
          </label>
        </div>
        <div className="container container-inline">
          {/* <input type="text" className="textInput" placeholder="Вотермарка" />*/}
          <label className="checkbox--container">
            <input name="light" onChange={this.handleInputChange} checked={light} type="checkbox" />
            <div className="checkmark">{light ? 'Светлый' : 'Тёмный'}</div>
          </label>
          <input onChange={this.handleOpacityChange} type="range" min="0" value={opacity} max="1" step="0.01" />
        </div>
        <div className="container">
          <div className="preview">
            {!rendering && lines.map((line, i) => (
              <Template ref={`stage${i}`} key={i + line} text={line} width={width / 2} height={height / 2} background={imageObj} opacity={opacity} light={light} font={font} />
            ))}
          </div>
          <div className="hide">
            {lines.map((line, i) => (
              <Template ref={`stage${i}`} key={i + line} text={line} width={widthHD} height={heightHD} background={imageObj} opacity={opacity} light={light} font={font} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
