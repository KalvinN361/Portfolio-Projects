import { useVideoConfig, useCurrentFrame, AbsoluteFill, Img, Video } from 'remotion';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useCallback, useState } from 'react';
import { continueRender, delayRender } from 'remotion';
import { Composition, LayerType } from './generated';
import { OffthreadVideo } from 'remotion';
import { Gif } from "@remotion/gif";

const supabaseUrl = "https://ihboqqomxmcwyjbxrlpj.supabase.co";
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm9xcW9teG1jd3lqYnhybHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDc5OTgzMDEsImV4cCI6MTk2MzU3NDMwMX0.h5JPY4tOUZxbBEdAegnYcs35hpdZGt80vCXep5daWAs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
interface compProp {
	compId: string
}
export const RemoteVideo: React.FC = (defaultProps) => {
	// const {fps, durationInFrames, width, height} = useVideoConfig();
	const props = defaultProps as compProp
	const compId = props.compId
	// const frame = useCurrentFrame();
	console.log(compId)
	const [compositionData, setData] = useState<Composition>();
	const [handle] = useState(() => delayRender());
	// const [chnagedData, setData] = useState(false);


	const fetchData = useCallback(async () => {
		const { data, error } = await supabase
			.from('composition')
			.select(
				`*`
			)
			.eq('id', compId)
			.single();
		if (error) {
			console.log(error);
		} else {
			console.log(data);
			setData(data);
		}

		continueRender(handle);
	}, [handle]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<AbsoluteFill>
			{compositionData?.state?.layers?.map((layer) => {
			// {console.log(layer)}
				if (layer.type == 'VIDEO') {
					// if layer was cropped
					if ('crop' in layer) {
						// let widthRatio = 
						// widthRatio
						// let newX = Math.round(layer.crop?.value?.x! / (layer.crop?.reference?.width! / compositionData?.size?.width!))
						// let newY = Math.round(layer.crop?.value?.y! / (layer.crop?.reference?.height! / compositionData?.size?.height!) )
						// console.log(newX)
						// console.log(layer.state.x - layer.crop?.value?.x!)
						// console.log(layer.state.y - layer.crop?.value?.y!)
						// layer.state.x = layer.state.x - layer.crop?.value?.x!
						const newX = layer.state.x! - layer.crop?.value?.x!
						// layer.state.y = layer.state.y - layer.crop?.value?.y!
						const newY = layer.state.y! - layer.crop?.value?.y!
						layer.state.width = Math.round(layer.crop?.reference?.width!)
						layer.state.height = Math.round(layer.crop?.reference?.height!)
						return (
							// <AbsoluteFill>
							<Video
								src={layer?.source?.file!}
								style={{
									height: layer.state.height,
									width: layer.state.width,
									left: newX,
									top: newY,
									position: 'absolute',
									zIndex: -newY
								}}
								// volume={layer.volume == 1 ? 0.9 : 0}
								muted={layer.volume == 1 ? false : true}
								// startFrom = {layer!.startFrom}
								// endAt = {layer!.endAt}
							/>
							// </AbsoluteFill>
						)
					} else if (layer.source?.fileType == 'mp3'){
						return (
							<Video
							src={layer?.source?.file!}
							style={{
								height: 1,
								width: 1,
								left: -10,
								top: -10,
								position: 'absolute',
								zIndex: -1 * layer?.state?.y!,
							}}
							startFrom = {layer!.startFrom}
							endAt = {layer!.endAt}
							// volume={layer.volume == 1 ? 0.9 : 0}
							muted={layer.volume == 1 ? false : true}

							/>
						)

					 }else {
						return (
							// <AbsoluteFill>
							<Video
								src={layer?.source?.file!}
								style={{
									height: layer.state.height,
									width: layer.state.width,
									left: layer.state.x,
									top: layer?.state?.y,
									position: 'absolute',
									zIndex: -1 * layer?.state?.y!,
								}}
								// startFrom = {layer!.startFrom}
								// endAt = {layer!.endAt}
								// volume={layer.volume == 1 ? 0.9 : 0}
								muted={layer.volume == 1 ? false : true}

							/>
							// </AbsoluteFill>
						)
					}
				} else if (layer.type == 'TEXT') {
					let defaultStyle = {
						height: layer.state.height,
						width: layer.state.width,
						left: layer.state.x,
						top: layer.state.y,
						position: 'absolute',
					};
					const combinedStyles = { ...defaultStyle, ...layer.style };
					return <div style={combinedStyles}>{layer.content}</div>;
				} else if (layer.type == 'IMAGE') {
					let defaultStyle = {
						height: layer.state.height,
						width: layer.state.width,
						left: layer.state.x,
						top: layer.state.y,
						position: 'absolute',
					};
					const combinedStyles = { ...defaultStyle, ...layer.style };
					if(layer.source?.fileType == "gif") {
						return (
							<Gif
							src={layer?.source?.file!}
							width={defaultStyle.width}
							height={defaultStyle.height}
							fit="fill"
							style={combinedStyles}
							
						/>
						)
					} else {
						return (
							<Img 
							src={layer?.source?.file!}
							width={defaultStyle.width}
							height={defaultStyle.height}
							style={combinedStyles}
							/>
						)
					}

				}
			})}
		</AbsoluteFill>
	);
};
