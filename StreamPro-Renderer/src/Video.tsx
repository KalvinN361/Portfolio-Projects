import {Composition, getInputProps } from 'remotion';
import {RemoteVideo} from './RemoteVideo';
const inputProps = getInputProps();

export const RemotionVideo: React.FC = () => {
	const compId = inputProps?.compId
	return (
		<>
			<Composition
				id="RemoteVideo"
				component={RemoteVideo}
				durationInFrames={inputProps?.duration ?? 239}
				
				fps={inputProps?.fps ?? 30}
				width={inputProps?.width ?? 720}
				height={inputProps?.height ?? 1280}
				defaultProps={{
					compId: "6acd4edb-749b-4c73-bff7-ef36181d0935",
				}}
			/>
		</>
	);
};
