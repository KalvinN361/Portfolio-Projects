import React from "react";

const About = () => {
	return (
		<div
			name="about"
			className="w-full h-100 bg-gradient-to-b from-gray-800 to-black text-white about"
		>
			<div className="max-w-screen-lg p-4 mx-auto flex flex-col justify-center w-full h-full">
				<div className="pb-8">
					<p className="text-4xl font-bold inline border-b-4 border-gray-500">
						About Me
					</p>
				</div>

				<p className="text-xl mt-5">
					I am a software engineer, working in both, backend and frontend
					programming with working knowledge of AWS. Excited for improving my
					skills and learning new technologies.
				</p>

				<br />

				<p className="text-xl">
					I thrive in a team environment while also being able to work
					individually <br /> <br />I began coding in highschool, but ultimately
					went to school for dental. After College, I found my love for coding
					again and decided to pursue it as a career.
				</p>
			</div>
		</div>
	);
};

export default About;
