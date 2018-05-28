import React, { PureComponent } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva';
import { Text as KonvaText } from 'konva';
import fileSaver from 'file-saver';

class Template extends PureComponent {
  getFontSize() {
    return this.props.fontSize || this.props.height / 9;
  }
  getPadding() {
    return this.props.padding || this.props.width / 50;
  }
  calculateTextHeight(fontSize, padding) {
    const text = new KonvaText({
      width: this.props.width,
      align: 'center',
      fontSize,
      fontFamily: 'Amatic SC',
      text: this.props.text,
      padding,
    });
    return text.getHeight();
  }
  render() {
    const { background, text, width, height, opacity, light } = this.props;
    const fontSize = this.getFontSize();
    const padding = this.getPadding();
    const textHeight = this.calculateTextHeight(fontSize, padding);
    return (
      <Stage pixelRatio={2} width={width} height={height}>
        <Layer>
          <Rect width={width} height={height} fill="#EEE" />
          {background && <KonvaImage width={width} height={height} image={background} />}
          <Rect width={width} height={height} fill={light ? '#FFF' : '#000'} opacity={opacity} />
          {!!text && <Text
            y={(height - textHeight) / 2}
            width={width}
            align="center"
            fontSize={fontSize}
            fontFamily="Amatic SC"
            text={text}
            fill={light ? 'black' : 'white'}
            padding={padding}
          />}
        </Layer>
      </Stage>);
  }
}

export default Template;
