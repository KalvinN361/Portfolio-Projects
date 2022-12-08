import {gql} from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T;
export type Exact<T extends {[key: string]: unknown}> = {
	[K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]: Maybe<T[SubKey]>;
};
const defaultOptions = {};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: string;
	String: string;
	Boolean: boolean;
	Int: number;
	Float: number;
	/**
	 * The `DateTime` scalar type represents a date and time in the UTC
	 * timezone. The DateTime appears in a JSON response as an ISO8601 formatted
	 * string, including UTC timezone ("Z"). The parsed date and time string will
	 * be converted to UTC if there is an offset.
	 */
	DateTime: any;
	/**
	 * The `Json` scalar type represents arbitrary json string data, represented as UTF-8
	 * character sequences. The Json type is most often used to represent a free-form
	 * human-readable json string.
	 */
	Json: any;
};

export type AuthenticationObject = {
	__typename?: 'AuthenticationObject';
	token?: Maybe<Scalars['String']>;
	user?: Maybe<User>;
};

export type BlurBlock = {
	__typename?: 'BlurBlock';
	value: Scalars['Float'];
};

export type Boundary = {
	__typename?: 'Boundary';
	height?: Maybe<Scalars['Float']>;
	width?: Maybe<Scalars['Float']>;
	x?: Maybe<Scalars['Float']>;
	y?: Maybe<Scalars['Float']>;
};

export type Composition = Node & {
	__typename?: 'Composition';
	id: Scalars['ID'];
	progress?: Maybe<Scalars['Float']>;
	size?: Maybe<Dimension>;
	state?: Maybe<CompositionState>;
	status?: Maybe<CompositionStatus>;
	thumbnail?: Maybe<Scalars['String']>;
	title?: Maybe<Scalars['String']>;
	video?: Maybe<Scalars['String']>;
};

export type CompositionCategory = {
	__typename?: 'CompositionCategory';
	game?: Maybe<Game>;
	id: Scalars['ID'];
};

export type CompositionConnection = {
	__typename?: 'CompositionConnection';
	edges?: Maybe<Array<Maybe<CompositionEdge>>>;
	pageInfo: PageInfo;
};

export type CompositionEdge = {
	__typename?: 'CompositionEdge';
	cursor?: Maybe<Scalars['String']>;
	node?: Maybe<Composition>;
};

export type CompositionState = {
	__typename?: 'CompositionState';
	durationInFrames?: Maybe<Scalars['Int']>;
	framesPerSecond?: Maybe<Scalars['Int']>;
	layers?: Maybe<Array<Maybe<Layer>>>;
	size?: Maybe<Dimension>;
	style?: Maybe<Scalars['Json']>;
};

export enum CompositionStatus {
	Complete = 'COMPLETE',
	Editing = 'EDITING',
	Failed = 'FAILED',
	Processing = 'PROCESSING',
}

export type CompositionTemplate = {
	__typename?: 'CompositionTemplate';
	categories?: Maybe<Array<Maybe<CompositionCategory>>>;
	fallback?: Maybe<Scalars['Boolean']>;
	id: Scalars['ID'];
	layers?: Maybe<Array<Maybe<DeprecatedLayer>>>;
	outputType?: Maybe<OutputType>;
	reference?: Maybe<FileUpload>;
	size?: Maybe<Dimension>;
	state?: Maybe<CompositionState>;
	thumbnail?: Maybe<Scalars['String']>;
	title?: Maybe<Scalars['String']>;
};

export type Connection =
	| DiscordConnection
	| GoogleConnection
	| TikTokConnection;

export type Crop = {
	__typename?: 'Crop';
	reference?: Maybe<Dimension>;
	value?: Maybe<Boundary>;
};

export type CropBlock = {
	__typename?: 'CropBlock';
	mode: CropType;
	value: Boundary;
};

export enum CropType {
	Circle = 'CIRCLE',
	Rectangle = 'RECTANGLE',
}

export type DefaultTemplateObject = {
	__typename?: 'DefaultTemplateObject';
	newTemplate?: Maybe<CompositionTemplate>;
	oldTemplate?: Maybe<CompositionTemplate>;
};

export type DeprecatedBlocks = {
	__typename?: 'DeprecatedBlocks';
	blur?: Maybe<BlurBlock>;
	crop?: Maybe<CropBlock>;
};

export type DeprecatedLayer = {
	__typename?: 'DeprecatedLayer';
	blocks?: Maybe<DeprecatedBlocks>;
	name?: Maybe<Scalars['String']>;
	state: Boundary;
};

export type Dimension = {
	__typename?: 'Dimension';
	height?: Maybe<Scalars['Float']>;
	width?: Maybe<Scalars['Float']>;
};

export type DiscordChannel = {
	__typename?: 'DiscordChannel';
	id?: Maybe<Scalars['ID']>;
	name?: Maybe<Scalars['String']>;
};

export type DiscordConnection = {
	__typename?: 'DiscordConnection';
	id?: Maybe<Scalars['ID']>;
	provider?: Maybe<ProviderType>;
	settings?: Maybe<DiscordSettings>;
};

export type DiscordSettings = {
	__typename?: 'DiscordSettings';
	channelId?: Maybe<Scalars['String']>;
	channels?: Maybe<Array<Maybe<DiscordChannel>>>;
	guildName?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['ID']>;
};

export type FileUpload = {
	__typename?: 'FileUpload';
	file?: Maybe<Scalars['String']>;
	fileType?: Maybe<Scalars['String']>;
	framesPerSecond?: Maybe<Scalars['Int']>;
	id: Scalars['ID'];
	user_id: Scalars['ID'];
	name?: Maybe<Scalars['String']>;
	numberOfFrames?: Maybe<Scalars['Int']>;
	size?: Maybe<Dimension>;
	thumbnail?: Maybe<Scalars['String']>;
};

export type FileUploadConnection = {
	__typename?: 'FileUploadConnection';
	edges?: Maybe<Array<Maybe<FileUploadEdge>>>;
	pageInfo: PageInfo;
};

export type FileUploadEdge = {
	__typename?: 'FileUploadEdge';
	cursor?: Maybe<Scalars['String']>;
	node?: Maybe<FileUpload>;
};

export type Game = {
	__typename?: 'Game';
	id?: Maybe<Scalars['ID']>;
	imageUrl?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	twitchId?: Maybe<Scalars['String']>;
};

export type GoogleConnection = {
	__typename?: 'GoogleConnection';
	id?: Maybe<Scalars['ID']>;
	provider?: Maybe<ProviderType>;
};

export type InputBoundary = {
	height: Scalars['Float'];
	width: Scalars['Float'];
	x: Scalars['Float'];
	y: Scalars['Float'];
};

export type InputCompositionState = {
	durationInFrames?: Maybe<Scalars['Int']>;
	framesPerSecond?: Maybe<Scalars['Int']>;
	layers?: Maybe<Array<Maybe<InputLayer>>>;
	size?: Maybe<InputDimension>;
	style?: Maybe<Scalars['Json']>;
};

export type InputCrop = {
	reference?: Maybe<InputDimension>;
	value?: Maybe<InputBoundary>;
};

export type InputDimension = {
	height: Scalars['Int'];
	width: Scalars['Int'];
};

export type InputLayer = {
	content?: Maybe<Scalars['String']>;
	crop?: Maybe<InputCrop>;
	durationInFrames?: Maybe<Scalars['Int']>;
	endAt?: Maybe<Scalars['Int']>;
	endFrame?: Maybe<Scalars['Int']>;
	id?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	source?: FileUpload;
	startFrame?: Maybe<Scalars['Int']>;
	startFrom?: Maybe<Scalars['Int']>;
	state?: Maybe<InputBoundary>;
	style?: Maybe<Scalars['Json']>;
	type?: Maybe<LayerType>;
	volume?: Maybe<Scalars['Float']>;
};

export type Layer = {
	__typename?: 'Layer';
	content?: Maybe<Scalars['String']>;
	crop?: Maybe<Crop>;
	durationInFrames?: Maybe<Scalars['Int']>;
	endAt?: Maybe<Scalars['Int']>;
	endFrame?: Maybe<Scalars['Int']>;
	id?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	source?: Maybe<FileUpload>;
	startFrame?: Maybe<Scalars['Int']>;
	startFrom?: Maybe<Scalars['Int']>;
	state: Boundary;
	style?: Maybe<Scalars['Json']>;
	type?: Maybe<LayerType>;
	volume?: Maybe<Scalars['Float']>;
};

export enum LayerType {
	Image = 'IMAGE',
	Text = 'TEXT',
	Video = 'VIDEO',
}

export type Node = {
	/** The ID of the object. */
	id: Scalars['ID'];
};

export enum OutputType {
	Landscape = 'LANDSCAPE',
	Portrait = 'PORTRAIT',
	Square = 'SQUARE',
}

export type PageInfo = {
	__typename?: 'PageInfo';
	/** When paginating forwards, the cursor to continue. */
	endCursor?: Maybe<Scalars['String']>;
	/** When paginating forwards, are there more items? */
	hasNextPage: Scalars['Boolean'];
	/** When paginating backwards, are there more items? */
	hasPreviousPage: Scalars['Boolean'];
	/** When paginating backwards, the cursor to continue. */
	startCursor?: Maybe<Scalars['String']>;
};

export type PaymentSubscription = {
	__typename?: 'PaymentSubscription';
	currentPeriodEnd?: Maybe<Scalars['Int']>;
	id?: Maybe<Scalars['ID']>;
	status?: Maybe<Scalars['String']>;
};

export enum PlatformType {
	TikTok = 'TIK_TOK',
	Youtube = 'YOUTUBE',
}

export type PresignedUrlObject = {
	__typename?: 'PresignedUrlObject';
	key?: Maybe<Scalars['String']>;
	url?: Maybe<Scalars['String']>;
};

export enum ProviderType {
	Discord = 'DISCORD',
	Google = 'GOOGLE',
	TikTok = 'TIK_TOK',
}

export type RootMutationType = {
	__typename?: 'RootMutationType';
	authenticate?: Maybe<AuthenticationObject>;
	createComposition?: Maybe<Composition>;
	createCompositionTemplate?: Maybe<CompositionTemplate>;
	createImportUpload?: Maybe<FileUpload>;
	createLocalUpload?: Maybe<FileUpload>;
	createShareAction?: Maybe<ShareAction>;
	createSubscription?: Maybe<PaymentSubscription>;
	deleteCompositionTemplate?: Maybe<CompositionTemplate>;
	deleteConnection?: Maybe<Connection>;
	processComposition?: Maybe<Composition>;
	signOut?: Maybe<Scalars['Boolean']>;
	updateCompositionTemplateCategories?: Maybe<CompositionTemplate>;
	updateDefaultCompositionTemplate?: Maybe<DefaultTemplateObject>;
	updateDiscordSettings?: Maybe<DiscordSettings>;
	updateSettings?: Maybe<Settings>;
	updateSubscription?: Maybe<PaymentSubscription>;
};

export type RootMutationTypeAuthenticateArgs = {
	code: Scalars['String'];
};

export type RootMutationTypeCreateCompositionArgs = {
	state: InputCompositionState;
	title: Scalars['String'];
};

export type RootMutationTypeCreateCompositionTemplateArgs = {
	state: InputCompositionState;
	title: Scalars['String'];
};

export type RootMutationTypeCreateImportUploadArgs = {
	id: Scalars['ID'];
};

export type RootMutationTypeCreateLocalUploadArgs = {
	key: Scalars['ID'];
	name: Scalars['String'];
	type: UploadType;
};

export type RootMutationTypeCreateShareActionArgs = {
	id: Scalars['ID'];
	metadata?: Maybe<ShareActionMetadata>;
	platform: PlatformType;
};

export type RootMutationTypeCreateSubscriptionArgs = {
	id: Scalars['ID'];
	type: SubscriptionType;
};

export type RootMutationTypeDeleteCompositionTemplateArgs = {
	id: Scalars['ID'];
};

export type RootMutationTypeDeleteConnectionArgs = {
	id: Scalars['ID'];
};

export type RootMutationTypeProcessCompositionArgs = {
	id: Scalars['ID'];
	state: InputCompositionState;
	title: Scalars['String'];
};

export type RootMutationTypeUpdateCompositionTemplateCategoriesArgs = {
	categories: Array<Maybe<Scalars['ID']>>;
	id: Scalars['ID'];
};

export type RootMutationTypeUpdateDefaultCompositionTemplateArgs = {
	id?: Maybe<Scalars['ID']>;
};

export type RootMutationTypeUpdateDiscordSettingsArgs = {
	channelId?: Maybe<Scalars['String']>;
};

export type RootMutationTypeUpdateSettingsArgs = {
	automation: Scalars['Boolean'];
	streamSummary: Scalars['Boolean'];
};

export type RootMutationTypeUpdateSubscriptionArgs = {
	id: Scalars['ID'];
};

export type RootQueryType = {
	__typename?: 'RootQueryType';
	composition?: Maybe<Composition>;
	compositionTemplates?: Maybe<Array<Maybe<CompositionTemplate>>>;
	compositions?: Maybe<CompositionConnection>;
	connection?: Maybe<Connection>;
	connections?: Maybe<Array<Maybe<Connection>>>;
	fileUploads?: Maybe<FileUploadConnection>;
	getPresignedUrl?: Maybe<PresignedUrlObject>;
	me?: Maybe<User>;
	recentStream?: Maybe<Stream>;
	searchCategories?: Maybe<Array<Maybe<TwitchGame>>>;
	settings?: Maybe<Settings>;
	twitchClip?: Maybe<TwitchClip>;
	twitchClips?: Maybe<Array<Maybe<TwitchClip>>>;
};

export type RootQueryTypeCompositionArgs = {
	id: Scalars['ID'];
};

export type RootQueryTypeCompositionsArgs = {
	after?: Maybe<Scalars['String']>;
	before?: Maybe<Scalars['String']>;
	first?: Maybe<Scalars['Int']>;
	last?: Maybe<Scalars['Int']>;
};

export type RootQueryTypeConnectionArgs = {
	type: ProviderType;
};

export type RootQueryTypeFileUploadsArgs = {
	after?: Maybe<Scalars['String']>;
	before?: Maybe<Scalars['String']>;
	first?: Maybe<Scalars['Int']>;
	last?: Maybe<Scalars['Int']>;
	type: UploadType;
};

export type RootQueryTypeGetPresignedUrlArgs = {
	name: Scalars['String'];
	type: Scalars['String'];
};

export type RootQueryTypeSearchCategoriesArgs = {
	input: Scalars['String'];
};

export type RootQueryTypeTwitchClipArgs = {
	url: Scalars['String'];
};

export type RootQueryTypeTwitchClipsArgs = {
	endTime: Scalars['DateTime'];
	startTime: Scalars['DateTime'];
};

export type Settings = {
	__typename?: 'Settings';
	automationEnabled?: Maybe<Scalars['Boolean']>;
	manageUrl?: Maybe<Scalars['String']>;
	streamSummary?: Maybe<Scalars['Boolean']>;
};

export type ShareAction = {
	__typename?: 'ShareAction';
	id?: Maybe<Scalars['ID']>;
	platform?: Maybe<PlatformType>;
	status?: Maybe<ShareStatus>;
};

export type ShareActionMetadata = {
	category?: Maybe<Scalars['String']>;
	description?: Maybe<Scalars['String']>;
	privacy?: Maybe<Scalars['String']>;
	tags?: Maybe<Array<Maybe<Scalars['String']>>>;
	title?: Maybe<Scalars['String']>;
};

export enum ShareStatus {
	Failed = 'FAILED',
	Pending = 'PENDING',
	Success = 'SUCCESS',
}

export type Stream = {
	__typename?: 'Stream';
	clips?: Maybe<Array<Maybe<TwitchClip>>>;
	endTime?: Maybe<Scalars['DateTime']>;
	id: Scalars['ID'];
	startTime?: Maybe<Scalars['DateTime']>;
};

export enum SubscriptionType {
	Annual = 'ANNUAL',
	Monthly = 'MONTHLY',
	Paypal = 'PAYPAL',
}

export type TikTokConnection = {
	__typename?: 'TikTokConnection';
	id?: Maybe<Scalars['ID']>;
	provider?: Maybe<ProviderType>;
};

export type TwitchClip = {
	__typename?: 'TwitchClip';
	createdAt?: Maybe<Scalars['String']>;
	creatorName?: Maybe<Scalars['String']>;
	game?: Maybe<Game>;
	id?: Maybe<Scalars['String']>;
	thumbnail?: Maybe<Scalars['String']>;
	title?: Maybe<Scalars['String']>;
	videoUrl?: Maybe<Scalars['String']>;
};

export type TwitchGame = {
	__typename?: 'TwitchGame';
	id: Scalars['ID'];
	imageUrl?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
};

export enum UploadType {
	Image = 'IMAGE',
	Video = 'VIDEO',
}

export type User = {
	__typename?: 'User';
	displayName?: Maybe<Scalars['String']>;
	hasCompositions?: Maybe<Scalars['Boolean']>;
	id?: Maybe<Scalars['ID']>;
	subscription?: Maybe<PaymentSubscription>;
	is_subscribed?: Maybe<Boolean>;
	email?: Maybe<string>;
	customer_id?: Maybe<string>;
	interval?: Maybe<string>;
};

export type AuthenticateMutationVariables = Exact<{
	code: Scalars['String'];
}>;

export type AuthenticateMutation = {__typename?: 'RootMutationType'} & {
	authenticate?: Maybe<
		{__typename?: 'AuthenticationObject'} & Pick<
			AuthenticationObject,
			'token'
		> & {
				user?: Maybe<
					{__typename?: 'User'} & Pick<
						User,
						'id' | 'displayName' | 'hasCompositions'
					> & {
							subscription?: Maybe<
								{__typename?: 'PaymentSubscription'} & Pick<
									PaymentSubscription,
									'currentPeriodEnd' | 'id' | 'status'
								>
							>;
						}
				>;
			}
	>;
};

export type CreateCompositionTemplateMutationVariables = Exact<{
	state: InputCompositionState;
	title: Scalars['String'];
}>;

export type CreateCompositionTemplateMutation = {
	__typename?: 'RootMutationType';
} & {
	createCompositionTemplate?: Maybe<
		{__typename?: 'CompositionTemplate'} & Pick<CompositionTemplate, 'id'>
	>;
};

export type CreateImportUploadMutationVariables = Exact<{
	id: Scalars['ID'];
}>;

export type CreateImportUploadMutation = {__typename?: 'RootMutationType'} & {
	createImportUpload?: Maybe<
		{__typename?: 'FileUpload'} & Pick<
			FileUpload,
			'id' | 'file' | 'framesPerSecond' | 'name' | 'numberOfFrames'
		> & {
				size?: Maybe<
					{__typename?: 'Dimension'} & Pick<Dimension, 'height' | 'width'>
				>;
			}
	>;
};

export type CreateLocalUploadMutationVariables = Exact<{
	key: Scalars['ID'];
	name: Scalars['String'];
	type: UploadType;
}>;

export type CreateLocalUploadMutation = {__typename?: 'RootMutationType'} & {
	createLocalUpload?: Maybe<
		{__typename?: 'FileUpload'} & Pick<
			FileUpload,
			'id' | 'file' | 'fileType' | 'framesPerSecond' | 'name' | 'numberOfFrames'
		> & {
				size?: Maybe<
					{__typename?: 'Dimension'} & Pick<Dimension, 'height' | 'width'>
				>;
			}
	>;
};

export type CreateShareActionMutationVariables = Exact<{
	id: Scalars['ID'];
	platform: PlatformType;
	metadata?: Maybe<ShareActionMetadata>;
}>;

export type CreateShareActionMutation = {__typename?: 'RootMutationType'} & {
	createShareAction?: Maybe<
		{__typename?: 'ShareAction'} & Pick<
			ShareAction,
			'id' | 'platform' | 'status'
		>
	>;
};

export type CreateSubscriptionMutationVariables = Exact<{
	id: Scalars['ID'];
	type: SubscriptionType;
}>;

export type CreateSubscriptionMutation = {__typename?: 'RootMutationType'} & {
	createSubscription?: Maybe<
		{__typename?: 'PaymentSubscription'} & Pick<
			PaymentSubscription,
			'currentPeriodEnd' | 'id' | 'status'
		>
	>;
};

export type DeleteCompositionTemplateMutationVariables = Exact<{
	id: Scalars['ID'];
}>;

export type DeleteCompositionTemplateMutation = {
	__typename?: 'RootMutationType';
} & {
	deleteCompositionTemplate?: Maybe<
		{__typename?: 'CompositionTemplate'} & Pick<CompositionTemplate, 'id'>
	>;
};

export type DeleteConnectionMutationVariables = Exact<{
	id: Scalars['ID'];
}>;

export type DeleteConnectionMutation = {__typename?: 'RootMutationType'} & {
	deleteConnection?: Maybe<
		| ({__typename: 'DiscordConnection'} & Pick<
				DiscordConnection,
				'id' | 'provider'
		  > & {
					settings?: Maybe<
						{__typename?: 'DiscordSettings'} & Pick<
							DiscordSettings,
							'channelId' | 'guildName' | 'id'
						> & {
								channels?: Maybe<
									Array<
										Maybe<
											{__typename?: 'DiscordChannel'} & Pick<
												DiscordChannel,
												'id' | 'name'
											>
										>
									>
								>;
							}
					>;
				})
		| ({__typename: 'GoogleConnection'} & Pick<
				GoogleConnection,
				'id' | 'provider'
		  >)
		| ({__typename: 'TikTokConnection'} & Pick<
				TikTokConnection,
				'id' | 'provider'
		  >)
	>;
};

export type CreateCompositionMutationVariables = Exact<{
	state: InputCompositionState;
	title: Scalars['String'];
}>;

export type CreateCompositionMutation = {__typename?: 'RootMutationType'} & {
	createComposition?: Maybe<
		{__typename?: 'Composition'} & Pick<Composition, 'id' | 'status'>
	>;
};

export type ProcessCompositionMutationVariables = Exact<{
	id: Scalars['ID'];
	state: InputCompositionState;
	title: Scalars['String'];
}>;

export type ProcessCompositionMutation = {__typename?: 'RootMutationType'} & {
	processComposition?: Maybe<
		{__typename?: 'Composition'} & Pick<Composition, 'id' | 'status'>
	>;
};

export type SignOutMutationVariables = Exact<{[key: string]: never}>;

export type SignOutMutation = {__typename?: 'RootMutationType'} & Pick<
	RootMutationType,
	'signOut'
>;

export type UpdateCompositionTemplateCategoriesMutationVariables = Exact<{
	id: Scalars['ID'];
	categories: Array<Maybe<Scalars['ID']>> | Maybe<Scalars['ID']>;
}>;

export type UpdateCompositionTemplateCategoriesMutation = {
	__typename?: 'RootMutationType';
} & {
	updateCompositionTemplateCategories?: Maybe<
		{__typename?: 'CompositionTemplate'} & Pick<CompositionTemplate, 'id'> & {
				categories?: Maybe<
					Array<
						Maybe<
							{__typename?: 'CompositionCategory'} & Pick<
								CompositionCategory,
								'id'
							> & {
									game?: Maybe<
										{__typename?: 'Game'} & Pick<
											Game,
											'id' | 'imageUrl' | 'name' | 'twitchId'
										>
									>;
								}
						>
					>
				>;
			}
	>;
};

export type UpdateDefaultCompositionTemplateMutationVariables = Exact<{
	id?: Maybe<Scalars['ID']>;
}>;

export type UpdateDefaultCompositionTemplateMutation = {
	__typename?: 'RootMutationType';
} & {
	updateDefaultCompositionTemplate?: Maybe<
		{__typename?: 'DefaultTemplateObject'} & {
			oldTemplate?: Maybe<
				{__typename?: 'CompositionTemplate'} & Pick<
					CompositionTemplate,
					'id' | 'fallback'
				>
			>;
			newTemplate?: Maybe<
				{__typename?: 'CompositionTemplate'} & Pick<
					CompositionTemplate,
					'id' | 'fallback'
				>
			>;
		}
	>;
};

export type UpdateDiscordSettingsMutationVariables = Exact<{
	channelId?: Maybe<Scalars['String']>;
}>;

export type UpdateDiscordSettingsMutation = {
	__typename?: 'RootMutationType';
} & {
	updateDiscordSettings?: Maybe<
		{__typename?: 'DiscordSettings'} & Pick<DiscordSettings, 'id' | 'channelId'>
	>;
};

export type UpdateSettingsMutationVariables = Exact<{
	automation: Scalars['Boolean'];
	streamSummary: Scalars['Boolean'];
}>;

export type UpdateSettingsMutation = {__typename?: 'RootMutationType'} & {
	updateSettings?: Maybe<
		{__typename?: 'Settings'} & Pick<
			Settings,
			'automationEnabled' | 'streamSummary'
		>
	>;
};

export type UpdateSubscriptionMutationVariables = Exact<{
	id: Scalars['ID'];
}>;

export type UpdateSubscriptionMutation = {__typename?: 'RootMutationType'} & {
	updateSubscription?: Maybe<
		{__typename?: 'PaymentSubscription'} & Pick<
			PaymentSubscription,
			'id' | 'status'
		>
	>;
};

export type GetConnectionQueryVariables = Exact<{
	type: ProviderType;
}>;

export type GetConnectionQuery = {__typename?: 'RootQueryType'} & {
	connection?: Maybe<
		| ({__typename: 'DiscordConnection'} & Pick<
				DiscordConnection,
				'id' | 'provider'
		  > & {
					settings?: Maybe<
						{__typename?: 'DiscordSettings'} & Pick<
							DiscordSettings,
							'channelId' | 'guildName' | 'id'
						> & {
								channels?: Maybe<
									Array<
										Maybe<
											{__typename?: 'DiscordChannel'} & Pick<
												DiscordChannel,
												'id' | 'name'
											>
										>
									>
								>;
							}
					>;
				})
		| ({__typename: 'GoogleConnection'} & Pick<
				GoogleConnection,
				'id' | 'provider'
		  >)
		| ({__typename: 'TikTokConnection'} & Pick<
				TikTokConnection,
				'id' | 'provider'
		  >)
	>;
};

export type ConnectionsQueryVariables = Exact<{[key: string]: never}>;

export type ConnectionsQuery = {__typename?: 'RootQueryType'} & {
	connections?: Maybe<
		Array<
			Maybe<
				| ({__typename: 'DiscordConnection'} & Pick<
						DiscordConnection,
						'id' | 'provider'
				  > & {
							settings?: Maybe<
								{__typename?: 'DiscordSettings'} & Pick<
									DiscordSettings,
									'channelId' | 'guildName' | 'id'
								> & {
										channels?: Maybe<
											Array<
												Maybe<
													{__typename?: 'DiscordChannel'} & Pick<
														DiscordChannel,
														'id' | 'name'
													>
												>
											>
										>;
									}
							>;
						})
				| ({__typename: 'GoogleConnection'} & Pick<
						GoogleConnection,
						'id' | 'provider'
				  >)
				| ({__typename: 'TikTokConnection'} & Pick<
						TikTokConnection,
						'id' | 'provider'
				  >)
			>
		>
	>;
};

export type GetCompositionTemplatesQueryVariables = Exact<{
	[key: string]: never;
}>;

export type GetCompositionTemplatesQuery = {__typename?: 'RootQueryType'} & {
	compositionTemplates?: Maybe<
		Array<
			Maybe<
				{__typename?: 'CompositionTemplate'} & Pick<
					CompositionTemplate,
					'id' | 'outputType' | 'thumbnail' | 'title'
				> & {
						layers?: Maybe<
							Array<
								Maybe<
									{__typename?: 'DeprecatedLayer'} & Pick<
										DeprecatedLayer,
										'name'
									> & {
											blocks?: Maybe<
												{__typename?: 'DeprecatedBlocks'} & {
													blur?: Maybe<
														{__typename?: 'BlurBlock'} & Pick<
															BlurBlock,
															'value'
														>
													>;
													crop?: Maybe<
														{__typename?: 'CropBlock'} & Pick<
															CropBlock,
															'mode'
														> & {
																value: {__typename?: 'Boundary'} & Pick<
																	Boundary,
																	'height' | 'width' | 'x' | 'y'
																>;
															}
													>;
												}
											>;
											state: {__typename?: 'Boundary'} & Pick<
												Boundary,
												'height' | 'width' | 'x' | 'y'
											>;
										}
								>
							>
						>;
						reference?: Maybe<
							{__typename?: 'FileUpload'} & Pick<FileUpload, 'id'> & {
									size?: Maybe<
										{__typename?: 'Dimension'} & Pick<
											Dimension,
											'height' | 'width'
										>
									>;
								}
						>;
						size?: Maybe<
							{__typename?: 'Dimension'} & Pick<Dimension, 'height' | 'width'>
						>;
						state?: Maybe<
							{__typename?: 'CompositionState'} & Pick<
								CompositionState,
								'durationInFrames' | 'framesPerSecond' | 'style'
							> & {
									layers?: Maybe<
										Array<
											Maybe<
												{__typename?: 'Layer'} & Pick<
													Layer,
													| 'content'
													| 'durationInFrames'
													| 'endAt'
													| 'endFrame'
													| 'name'
													| 'startFrame'
													| 'startFrom'
													| 'style'
													| 'type'
													| 'volume'
												> & {
														crop?: Maybe<
															{__typename?: 'Crop'} & {
																reference?: Maybe<
																	{__typename?: 'Dimension'} & Pick<
																		Dimension,
																		'height' | 'width'
																	>
																>;
																value?: Maybe<
																	{__typename?: 'Boundary'} & Pick<
																		Boundary,
																		'height' | 'width' | 'x' | 'y'
																	>
																>;
															}
														>;
														state: {__typename?: 'Boundary'} & Pick<
															Boundary,
															'height' | 'width' | 'x' | 'y'
														>;
														source?: Maybe<
															{__typename?: 'FileUpload'} & Pick<
																FileUpload,
																| 'id'
																| 'file'
																| 'fileType'
																| 'framesPerSecond'
																| 'name'
																| 'numberOfFrames'
															> & {
																	size?: Maybe<
																		{__typename?: 'Dimension'} & Pick<
																			Dimension,
																			'height' | 'width'
																		>
																	>;
																}
														>;
													}
											>
										>
									>;
									size?: Maybe<
										{__typename?: 'Dimension'} & Pick<
											Dimension,
											'height' | 'width'
										>
									>;
								}
						>;
					}
			>
		>
	>;
};

export type GetCompositionQueryVariables = Exact<{
	id: Scalars['ID'];
}>;

export type GetCompositionQuery = {__typename?: 'RootQueryType'} & {
	composition?: Maybe<
		{__typename?: 'Composition'} & Pick<
			Composition,
			'id' | 'progress' | 'status' | 'title'
		> & {
				state?: Maybe<
					{__typename?: 'CompositionState'} & Pick<
						CompositionState,
						'durationInFrames' | 'framesPerSecond' | 'style'
					> & {
							layers?: Maybe<
								Array<
									Maybe<
										{__typename?: 'Layer'} & Pick<
											Layer,
											| 'content'
											| 'durationInFrames'
											| 'endAt'
											| 'endFrame'
											| 'name'
											| 'startFrame'
											| 'startFrom'
											| 'style'
											| 'type'
											| 'volume'
										> & {
												crop?: Maybe<
													{__typename?: 'Crop'} & {
														reference?: Maybe<
															{__typename?: 'Dimension'} & Pick<
																Dimension,
																'height' | 'width'
															>
														>;
														value?: Maybe<
															{__typename?: 'Boundary'} & Pick<
																Boundary,
																'height' | 'width' | 'x' | 'y'
															>
														>;
													}
												>;
												state: {__typename?: 'Boundary'} & Pick<
													Boundary,
													'height' | 'width' | 'x' | 'y'
												>;
												source?: Maybe<
													{__typename?: 'FileUpload'} & Pick<
														FileUpload,
														| 'id'
														| 'file'
														| 'fileType'
														| 'framesPerSecond'
														| 'name'
														| 'numberOfFrames'
													> & {
															size?: Maybe<
																{__typename?: 'Dimension'} & Pick<
																	Dimension,
																	'height' | 'width'
																>
															>;
														}
												>;
											}
									>
								>
							>;
							size?: Maybe<
								{__typename?: 'Dimension'} & Pick<Dimension, 'height' | 'width'>
							>;
						}
				>;
			}
	>;
};

export type GetCompositionsQueryVariables = Exact<{
	after?: Maybe<Scalars['String']>;
	before?: Maybe<Scalars['String']>;
	first?: Maybe<Scalars['Int']>;
	last?: Maybe<Scalars['Int']>;
}>;

export type GetCompositionsQuery = {__typename?: 'RootQueryType'} & {
	compositions?: Maybe<
		{__typename?: 'CompositionConnection'} & {
			edges?: Maybe<
				Array<
					Maybe<
						{__typename?: 'CompositionEdge'} & {
							node?: Maybe<
								{__typename?: 'Composition'} & Pick<
									Composition,
									'id' | 'status' | 'progress' | 'thumbnail' | 'title' | 'video'
								>
							>;
						}
					>
				>
			>;
			pageInfo: {__typename?: 'PageInfo'} & Pick<
				PageInfo,
				'endCursor' | 'hasNextPage'
			>;
		}
	>;
};

export type GetFileUploadsQueryVariables = Exact<{
	after?: Maybe<Scalars['String']>;
	before?: Maybe<Scalars['String']>;
	first?: Maybe<Scalars['Int']>;
	last?: Maybe<Scalars['Int']>;
	type: UploadType;
}>;

export type GetFileUploadsQuery = {__typename?: 'RootQueryType'} & {
	fileUploads?: Maybe<
		{__typename?: 'FileUploadConnection'} & {
			edges?: Maybe<
				Array<
					Maybe<
						{__typename?: 'FileUploadEdge'} & {
							node?: Maybe<
								{__typename?: 'FileUpload'} & Pick<
									FileUpload,
									| 'id'
									| 'file'
									| 'fileType'
									| 'framesPerSecond'
									| 'name'
									| 'numberOfFrames'
									| 'thumbnail'
								> & {
										size?: Maybe<
											{__typename?: 'Dimension'} & Pick<
												Dimension,
												'height' | 'width'
											>
										>;
									}
							>;
						}
					>
				>
			>;
			pageInfo: {__typename?: 'PageInfo'} & Pick<
				PageInfo,
				'endCursor' | 'hasNextPage'
			>;
		}
	>;
};

export type GetMeQueryVariables = Exact<{[key: string]: never}>;

export type GetMeQuery = {__typename?: 'RootQueryType'} & {
	me?: Maybe<
		{__typename?: 'User'} & Pick<
			User,
			'displayName' | 'id' | 'hasCompositions'
		> & {
				subscription?: Maybe<
					{__typename?: 'PaymentSubscription'} & Pick<
						PaymentSubscription,
						'currentPeriodEnd' | 'id' | 'status'
					>
				>;
			}
	>;
};

export type GetPresignedUrlQueryVariables = Exact<{
	name: Scalars['String'];
	type: Scalars['String'];
}>;

export type GetPresignedUrlQuery = {__typename?: 'RootQueryType'} & {
	getPresignedUrl?: Maybe<
		{__typename?: 'PresignedUrlObject'} & Pick<
			PresignedUrlObject,
			'key' | 'url'
		>
	>;
};

export type RecentStreamQueryVariables = Exact<{[key: string]: never}>;

export type RecentStreamQuery = {__typename?: 'RootQueryType'} & {
	recentStream?: Maybe<
		{__typename?: 'Stream'} & Pick<Stream, 'id' | 'endTime' | 'startTime'> & {
				clips?: Maybe<
					Array<
						Maybe<
							{__typename?: 'TwitchClip'} & Pick<
								TwitchClip,
								'id' | 'thumbnail' | 'title'
							> & {
									game?: Maybe<
										{__typename?: 'Game'} & Pick<
											Game,
											'id' | 'name' | 'twitchId'
										>
									>;
								}
						>
					>
				>;
			}
	>;
};

export type GetCompositionTemplatesWithCategoriesQueryVariables = Exact<{
	[key: string]: never;
}>;

export type GetCompositionTemplatesWithCategoriesQuery = {
	__typename?: 'RootQueryType';
} & {
	compositionTemplates?: Maybe<
		Array<
			Maybe<
				{__typename?: 'CompositionTemplate'} & Pick<
					CompositionTemplate,
					'fallback' | 'id' | 'thumbnail' | 'title'
				> & {
						categories?: Maybe<
							Array<
								Maybe<
									{__typename?: 'CompositionCategory'} & Pick<
										CompositionCategory,
										'id'
									> & {
											game?: Maybe<
												{__typename?: 'Game'} & Pick<
													Game,
													'id' | 'imageUrl' | 'name' | 'twitchId'
												>
											>;
										}
								>
							>
						>;
					}
			>
		>
	>;
};

export type SearchTwitchCategoriesQueryVariables = Exact<{
	input: Scalars['String'];
}>;

export type SearchTwitchCategoriesQuery = {__typename?: 'RootQueryType'} & {
	searchCategories?: Maybe<
		Array<
			Maybe<
				{__typename?: 'TwitchGame'} & Pick<
					TwitchGame,
					'id' | 'imageUrl' | 'name'
				>
			>
		>
	>;
};

export type SettingsQueryVariables = Exact<{[key: string]: never}>;

export type SettingsQuery = {__typename?: 'RootQueryType'} & {
	settings?: Maybe<
		{__typename?: 'Settings'} & Pick<
			Settings,
			'automationEnabled' | 'manageUrl' | 'streamSummary'
		>
	>;
};

export type TwitchClipQueryVariables = Exact<{
	url: Scalars['String'];
}>;

export type TwitchClipQuery = {__typename?: 'RootQueryType'} & {
	twitchClip?: Maybe<
		{__typename?: 'TwitchClip'} & Pick<
			TwitchClip,
			'id' | 'thumbnail' | 'title' | 'videoUrl'
		> & {
				game?: Maybe<
					{__typename?: 'Game'} & Pick<Game, 'id' | 'name' | 'twitchId'>
				>;
			}
	>;
};

export type TwitchClipsQueryVariables = Exact<{
	startTime: Scalars['DateTime'];
	endTime: Scalars['DateTime'];
}>;

export type TwitchClipsQuery = {__typename?: 'RootQueryType'} & {
	twitchClips?: Maybe<
		Array<
			Maybe<
				{__typename?: 'TwitchClip'} & Pick<
					TwitchClip,
					'id' | 'thumbnail' | 'title'
				> & {
						game?: Maybe<
							{__typename?: 'Game'} & Pick<Game, 'id' | 'name' | 'twitchId'>
						>;
					}
			>
		>
	>;
};

export const AuthenticateDocument = gql`
	mutation authenticate($code: String!) {
		authenticate(code: $code) {
			token
			user {
				id
				displayName
				hasCompositions
				subscription {
					currentPeriodEnd
					id
					status
				}
				webSocketToken
			}
		}
	}
`;
export type AuthenticateMutationFn = Apollo.MutationFunction<
	AuthenticateMutation,
	AuthenticateMutationVariables
>;

/**
 * __useAuthenticateMutation__
 *
 * To run a mutation, you first call `useAuthenticateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAuthenticateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [authenticateMutation, { data, loading, error }] = useAuthenticateMutation({
 *   variables: {
 *      code: // value for 'code'
 *   },
 * });
 */
export function useAuthenticateMutation(
	baseOptions?: Apollo.MutationHookOptions<
		AuthenticateMutation,
		AuthenticateMutationVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useMutation<
		AuthenticateMutation,
		AuthenticateMutationVariables
	>(AuthenticateDocument, options);
}
export type AuthenticateMutationHookResult = ReturnType<
	typeof useAuthenticateMutation
>;
export type AuthenticateMutationResult =
	Apollo.MutationResult<AuthenticateMutation>;
export type AuthenticateMutationOptions = Apollo.BaseMutationOptions<
	AuthenticateMutation,
	AuthenticateMutationVariables
>;
export const CreateCompositionTemplateDocument = gql`
	mutation createCompositionTemplate(
		$state: InputCompositionState!
		$title: String!
	) {
		createCompositionTemplate(state: $state, title: $title) {
			id
		}
	}
`;
export type CreateCompositionTemplateMutationFn = Apollo.MutationFunction<
	CreateCompositionTemplateMutation,
	CreateCompositionTemplateMutationVariables
>;

/**
 * __useCreateCompositionTemplateMutation__
 *
 * To run a mutation, you first call `useCreateCompositionTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCompositionTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCompositionTemplateMutation, { data, loading, error }] = useCreateCompositionTemplateMutation({
 *   variables: {
 *      state: // value for 'state'
 *      title: // value for 'title'
 *   },
 * });
 */
export function useCreateCompositionTemplateMutation(
	baseOptions?: Apollo.MutationHookOptions<
		CreateCompositionTemplateMutation,
		CreateCompositionTemplateMutationVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useMutation<
		CreateCompositionTemplateMutation,
		CreateCompositionTemplateMutationVariables
	>(CreateCompositionTemplateDocument, options);
}
export type CreateCompositionTemplateMutationHookResult = ReturnType<
	typeof useCreateCompositionTemplateMutation
>;
export type CreateCompositionTemplateMutationResult =
	Apollo.MutationResult<CreateCompositionTemplateMutation>;
export type CreateCompositionTemplateMutationOptions =
	Apollo.BaseMutationOptions<
		CreateCompositionTemplateMutation,
		CreateCompositionTemplateMutationVariables
	>;
export const CreateImportUploadDocument = gql`
	mutation createImportUpload($id: ID!) {
		createImportUpload(id: $id) {
			id
			file
			framesPerSecond
			name
			numberOfFrames
			size {
				height
				width
			}
		}
	}
`;
export type CreateImportUploadMutationFn = Apollo.MutationFunction<
	CreateImportUploadMutation,
	CreateImportUploadMutationVariables
>;

/**
 * __useCreateImportUploadMutation__
 *
 * To run a mutation, you first call `useCreateImportUploadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateImportUploadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createImportUploadMutation, { data, loading, error }] = useCreateImportUploadMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCreateImportUploadMutation(
	baseOptions?: Apollo.MutationHookOptions<
		CreateImportUploadMutation,
		CreateImportUploadMutationVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useMutation<
		CreateImportUploadMutation,
		CreateImportUploadMutationVariables
	>(CreateImportUploadDocument, options);
}
export type CreateImportUploadMutationHookResult = ReturnType<
	typeof useCreateImportUploadMutation
>;
export type CreateImportUploadMutationResult =
	Apollo.MutationResult<CreateImportUploadMutation>;
export type CreateImportUploadMutationOptions = Apollo.BaseMutationOptions<
	CreateImportUploadMutation,
	CreateImportUploadMutationVariables
>;
export const CreateLocalUploadDocument = gql`
	mutation createLocalUpload($key: ID!, $name: String!, $type: UploadType!) {
		createLocalUpload(key: $key, name: $name, type: $type) {
			id
			file
			fileType
			framesPerSecond
			name
			numberOfFrames
			size {
				height
				width
			}
		}
	}
`;
export type CreateLocalUploadMutationFn = Apollo.MutationFunction<
	CreateLocalUploadMutation,
	CreateLocalUploadMutationVariables
>;

/**
 * __useCreateLocalUploadMutation__
 *
 * To run a mutation, you first call `useCreateLocalUploadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateLocalUploadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createLocalUploadMutation, { data, loading, error }] = useCreateLocalUploadMutation({
 *   variables: {
 *      key: // value for 'key'
 *      name: // value for 'name'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useCreateLocalUploadMutation(
	baseOptions?: Apollo.MutationHookOptions<
		CreateLocalUploadMutation,
		CreateLocalUploadMutationVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useMutation<
		CreateLocalUploadMutation,
		CreateLocalUploadMutationVariables
	>(CreateLocalUploadDocument, options);
}
export type CreateLocalUploadMutationHookResult = ReturnType<
	typeof useCreateLocalUploadMutation
>;
export type CreateLocalUploadMutationResult =
	Apollo.MutationResult<CreateLocalUploadMutation>;
export type CreateLocalUploadMutationOptions = Apollo.BaseMutationOptions<
	CreateLocalUploadMutation,
	CreateLocalUploadMutationVariables
>;
export const CreateShareActionDocument = gql`
	mutation createShareAction(
		$id: ID!
		$platform: PlatformType!
		$metadata: ShareActionMetadata
	) {
		createShareAction(id: $id, metadata: $metadata, platform: $platform) {
			id
			platform
			status
		}
	}
`;
export type CreateShareActionMutationFn = Apollo.MutationFunction<
	CreateShareActionMutation,
	CreateShareActionMutationVariables
>;

/**
 * __useCreateShareActionMutation__
 *
 * To run a mutation, you first call `useCreateShareActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateShareActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createShareActionMutation, { data, loading, error }] = useCreateShareActionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      platform: // value for 'platform'
 *      metadata: // value for 'metadata'
 *   },
 * });
 */
export function useCreateShareActionMutation(
	baseOptions?: Apollo.MutationHookOptions<
		CreateShareActionMutation,
		CreateShareActionMutationVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useMutation<
		CreateShareActionMutation,
		CreateShareActionMutationVariables
	>(CreateShareActionDocument, options);
}
export type CreateShareActionMutationHookResult = ReturnType<
	typeof useCreateShareActionMutation
>;
export type CreateShareActionMutationResult =
	Apollo.MutationResult<CreateShareActionMutation>;
export type CreateShareActionMutationOptions = Apollo.BaseMutationOptions<
	CreateShareActionMutation,
	CreateShareActionMutationVariables
>;
export const CreateSubscriptionDocument = gql`
	mutation createSubscription($id: ID!, $type: SubscriptionType!) {
		createSubscription(id: $id, type: $type) {
			currentPeriodEnd
			id
			status
		}
	}
`;
export type CreateSubscriptionMutationFn = Apollo.MutationFunction<
	CreateSubscriptionMutation,
	CreateSubscriptionMutationVariables
>;

/**
 * __useCreateSubscriptionMutation__
 *
 * To run a mutation, you first call `useCreateSubscriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSubscriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSubscriptionMutation, { data, loading, error }] = useCreateSubscriptionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useCreateSubscriptionMutation(
	baseOptions?: Apollo.MutationHookOptions<
		CreateSubscriptionMutation,
		CreateSubscriptionMutationVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useMutation<
		CreateSubscriptionMutation,
		CreateSubscriptionMutationVariables
	>(CreateSubscriptionDocument, options);
}
export type CreateSubscriptionMutationHookResult = ReturnType<
	typeof useCreateSubscriptionMutation
>;
export type CreateSubscriptionMutationResult =
	Apollo.MutationResult<CreateSubscriptionMutation>;
export type CreateSubscriptionMutationOptions = Apollo.BaseMutationOptions<
	CreateSubscriptionMutation,
	CreateSubscriptionMutationVariables
>;
export const DeleteCompositionTemplateDocument = gql`
	mutation deleteCompositionTemplate($id: ID!) {
		deleteCompositionTemplate(id: $id) {
			id
		}
	}
`;
export type DeleteCompositionTemplateMutationFn = Apollo.MutationFunction<
	DeleteCompositionTemplateMutation,
	DeleteCompositionTemplateMutationVariables
>;

/**
 * __useDeleteCompositionTemplateMutation__
 *
 * To run a mutation, you first call `useDeleteCompositionTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCompositionTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCompositionTemplateMutation, { data, loading, error }] = useDeleteCompositionTemplateMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCompositionTemplateMutation(
	baseOptions?: Apollo.MutationHookOptions<
		DeleteCompositionTemplateMutation,
		DeleteCompositionTemplateMutationVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useMutation<
		DeleteCompositionTemplateMutation,
		DeleteCompositionTemplateMutationVariables
	>(DeleteCompositionTemplateDocument, options);
}
export type DeleteCompositionTemplateMutationHookResult = ReturnType<
	typeof useDeleteCompositionTemplateMutation
>;
export type DeleteCompositionTemplateMutationResult =
	Apollo.MutationResult<DeleteCompositionTemplateMutation>;
export type DeleteCompositionTemplateMutationOptions =
	Apollo.BaseMutationOptions<
		DeleteCompositionTemplateMutation,
		DeleteCompositionTemplateMutationVariables
	>;
export const DeleteConnectionDocument = gql`
	mutation deleteConnection($id: ID!) {
		deleteConnection(id: $id) {
			__typename
			... on DiscordConnection {
				id
				provider
				settings {
					channels {
						id
						name
					}
					channelId
					guildName
					id
				}
			}
			... on TikTokConnection {
				id
				provider
			}
			... on GoogleConnection {
				id
				provider
			}
		}
	}
`;
export type DeleteConnectionMutationFn = Apollo.MutationFunction<
	DeleteConnectionMutation,
	DeleteConnectionMutationVariables
>;

/**
 * __useDeleteConnectionMutation__
 *
 * To run a mutation, you first call `useDeleteConnectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteConnectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteConnectionMutation, { data, loading, error }] = useDeleteConnectionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteConnectionMutation(
	baseOptions?: Apollo.MutationHookOptions<
		DeleteConnectionMutation,
		DeleteConnectionMutationVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useMutation<
		DeleteConnectionMutation,
		DeleteConnectionMutationVariables
	>(DeleteConnectionDocument, options);
}
export type DeleteConnectionMutationHookResult = ReturnType<
	typeof useDeleteConnectionMutation
>;
export type DeleteConnectionMutationResult =
	Apollo.MutationResult<DeleteConnectionMutation>;
export type DeleteConnectionMutationOptions = Apollo.BaseMutationOptions<
	DeleteConnectionMutation,
	DeleteConnectionMutationVariables
>;
export const CreateCompositionDocument = gql`
	mutation createComposition($state: InputCompositionState!, $title: String!) {
		createComposition(state: $state, title: $title) {
			id
			status
		}
	}
`;
export type CreateCompositionMutationFn = Apollo.MutationFunction<
	CreateCompositionMutation,
	CreateCompositionMutationVariables
>;

/**
 * __useCreateCompositionMutation__
 *
 * To run a mutation, you first call `useCreateCompositionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCompositionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCompositionMutation, { data, loading, error }] = useCreateCompositionMutation({
 *   variables: {
 *      state: // value for 'state'
 *      title: // value for 'title'
 *   },
 * });
 */
export function useCreateCompositionMutation(
	baseOptions?: Apollo.MutationHookOptions<
		CreateCompositionMutation,
		CreateCompositionMutationVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useMutation<
		CreateCompositionMutation,
		CreateCompositionMutationVariables
	>(CreateCompositionDocument, options);
}
export type CreateCompositionMutationHookResult = ReturnType<
	typeof useCreateCompositionMutation
>;
export type CreateCompositionMutationResult =
	Apollo.MutationResult<CreateCompositionMutation>;
export type CreateCompositionMutationOptions = Apollo.BaseMutationOptions<
	CreateCompositionMutation,
	CreateCompositionMutationVariables
>;
export const ProcessCompositionDocument = gql`
	mutation processComposition(
		$id: ID!
		$state: InputCompositionState!
		$title: String!
	) {
		processComposition(id: $id, state: $state, title: $title) {
			id
			status
		}
	}
`;
export type ProcessCompositionMutationFn = Apollo.MutationFunction<
	ProcessCompositionMutation,
	ProcessCompositionMutationVariables
>;

/**
 * __useProcessCompositionMutation__
 *
 * To run a mutation, you first call `useProcessCompositionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useProcessCompositionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [processCompositionMutation, { data, loading, error }] = useProcessCompositionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      state: // value for 'state'
 *      title: // value for 'title'
 *   },
 * });
 */
export function useProcessCompositionMutation(
	baseOptions?: Apollo.MutationHookOptions<
		ProcessCompositionMutation,
		ProcessCompositionMutationVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useMutation<
		ProcessCompositionMutation,
		ProcessCompositionMutationVariables
	>(ProcessCompositionDocument, options);
}
export type ProcessCompositionMutationHookResult = ReturnType<
	typeof useProcessCompositionMutation
>;
export type ProcessCompositionMutationResult =
	Apollo.MutationResult<ProcessCompositionMutation>;
export type ProcessCompositionMutationOptions = Apollo.BaseMutationOptions<
	ProcessCompositionMutation,
	ProcessCompositionMutationVariables
>;
export const SignOutDocument = gql`
	mutation signOut {
		signOut
	}
`;
export type SignOutMutationFn = Apollo.MutationFunction<
	SignOutMutation,
	SignOutMutationVariables
>;

/**
 * __useSignOutMutation__
 *
 * To run a mutation, you first call `useSignOutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignOutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signOutMutation, { data, loading, error }] = useSignOutMutation({
 *   variables: {
 *   },
 * });
 */
export function useSignOutMutation(
	baseOptions?: Apollo.MutationHookOptions<
		SignOutMutation,
		SignOutMutationVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useMutation<SignOutMutation, SignOutMutationVariables>(
		SignOutDocument,
		options
	);
}
export type SignOutMutationHookResult = ReturnType<typeof useSignOutMutation>;
export type SignOutMutationResult = Apollo.MutationResult<SignOutMutation>;
export type SignOutMutationOptions = Apollo.BaseMutationOptions<
	SignOutMutation,
	SignOutMutationVariables
>;
export const UpdateCompositionTemplateCategoriesDocument = gql`
	mutation updateCompositionTemplateCategories($id: ID!, $categories: [ID]!) {
		updateCompositionTemplateCategories(id: $id, categories: $categories) {
			categories {
				id
				game {
					id
					imageUrl
					name
					twitchId
				}
			}
			id
		}
	}
`;
export type UpdateCompositionTemplateCategoriesMutationFn =
	Apollo.MutationFunction<
		UpdateCompositionTemplateCategoriesMutation,
		UpdateCompositionTemplateCategoriesMutationVariables
	>;

/**
 * __useUpdateCompositionTemplateCategoriesMutation__
 *
 * To run a mutation, you first call `useUpdateCompositionTemplateCategoriesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCompositionTemplateCategoriesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCompositionTemplateCategoriesMutation, { data, loading, error }] = useUpdateCompositionTemplateCategoriesMutation({
 *   variables: {
 *      id: // value for 'id'
 *      categories: // value for 'categories'
 *   },
 * });
 */
export function useUpdateCompositionTemplateCategoriesMutation(
	baseOptions?: Apollo.MutationHookOptions<
		UpdateCompositionTemplateCategoriesMutation,
		UpdateCompositionTemplateCategoriesMutationVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useMutation<
		UpdateCompositionTemplateCategoriesMutation,
		UpdateCompositionTemplateCategoriesMutationVariables
	>(UpdateCompositionTemplateCategoriesDocument, options);
}
export type UpdateCompositionTemplateCategoriesMutationHookResult = ReturnType<
	typeof useUpdateCompositionTemplateCategoriesMutation
>;
export type UpdateCompositionTemplateCategoriesMutationResult =
	Apollo.MutationResult<UpdateCompositionTemplateCategoriesMutation>;
export type UpdateCompositionTemplateCategoriesMutationOptions =
	Apollo.BaseMutationOptions<
		UpdateCompositionTemplateCategoriesMutation,
		UpdateCompositionTemplateCategoriesMutationVariables
	>;
export const UpdateDefaultCompositionTemplateDocument = gql`
	mutation updateDefaultCompositionTemplate($id: ID) {
		updateDefaultCompositionTemplate(id: $id) {
			oldTemplate {
				id
				fallback
			}
			newTemplate {
				id
				fallback
			}
		}
	}
`;
export type UpdateDefaultCompositionTemplateMutationFn =
	Apollo.MutationFunction<
		UpdateDefaultCompositionTemplateMutation,
		UpdateDefaultCompositionTemplateMutationVariables
	>;

/**
 * __useUpdateDefaultCompositionTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateDefaultCompositionTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDefaultCompositionTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDefaultCompositionTemplateMutation, { data, loading, error }] = useUpdateDefaultCompositionTemplateMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUpdateDefaultCompositionTemplateMutation(
	baseOptions?: Apollo.MutationHookOptions<
		UpdateDefaultCompositionTemplateMutation,
		UpdateDefaultCompositionTemplateMutationVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useMutation<
		UpdateDefaultCompositionTemplateMutation,
		UpdateDefaultCompositionTemplateMutationVariables
	>(UpdateDefaultCompositionTemplateDocument, options);
}
export type UpdateDefaultCompositionTemplateMutationHookResult = ReturnType<
	typeof useUpdateDefaultCompositionTemplateMutation
>;
export type UpdateDefaultCompositionTemplateMutationResult =
	Apollo.MutationResult<UpdateDefaultCompositionTemplateMutation>;
export type UpdateDefaultCompositionTemplateMutationOptions =
	Apollo.BaseMutationOptions<
		UpdateDefaultCompositionTemplateMutation,
		UpdateDefaultCompositionTemplateMutationVariables
	>;
export const UpdateDiscordSettingsDocument = gql`
	mutation updateDiscordSettings($channelId: String) {
		updateDiscordSettings(channelId: $channelId) {
			id
			channelId
		}
	}
`;
export type UpdateDiscordSettingsMutationFn = Apollo.MutationFunction<
	UpdateDiscordSettingsMutation,
	UpdateDiscordSettingsMutationVariables
>;

/**
 * __useUpdateDiscordSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateDiscordSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDiscordSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDiscordSettingsMutation, { data, loading, error }] = useUpdateDiscordSettingsMutation({
 *   variables: {
 *      channelId: // value for 'channelId'
 *   },
 * });
 */
export function useUpdateDiscordSettingsMutation(
	baseOptions?: Apollo.MutationHookOptions<
		UpdateDiscordSettingsMutation,
		UpdateDiscordSettingsMutationVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useMutation<
		UpdateDiscordSettingsMutation,
		UpdateDiscordSettingsMutationVariables
	>(UpdateDiscordSettingsDocument, options);
}
export type UpdateDiscordSettingsMutationHookResult = ReturnType<
	typeof useUpdateDiscordSettingsMutation
>;
export type UpdateDiscordSettingsMutationResult =
	Apollo.MutationResult<UpdateDiscordSettingsMutation>;
export type UpdateDiscordSettingsMutationOptions = Apollo.BaseMutationOptions<
	UpdateDiscordSettingsMutation,
	UpdateDiscordSettingsMutationVariables
>;
export const UpdateSettingsDocument = gql`
	mutation updateSettings($automation: Boolean!, $streamSummary: Boolean!) {
		updateSettings(automation: $automation, streamSummary: $streamSummary) {
			automationEnabled
			streamSummary
		}
	}
`;
export type UpdateSettingsMutationFn = Apollo.MutationFunction<
	UpdateSettingsMutation,
	UpdateSettingsMutationVariables
>;

/**
 * __useUpdateSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSettingsMutation, { data, loading, error }] = useUpdateSettingsMutation({
 *   variables: {
 *      automation: // value for 'automation'
 *      streamSummary: // value for 'streamSummary'
 *   },
 * });
 */
export function useUpdateSettingsMutation(
	baseOptions?: Apollo.MutationHookOptions<
		UpdateSettingsMutation,
		UpdateSettingsMutationVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useMutation<
		UpdateSettingsMutation,
		UpdateSettingsMutationVariables
	>(UpdateSettingsDocument, options);
}
export type UpdateSettingsMutationHookResult = ReturnType<
	typeof useUpdateSettingsMutation
>;
export type UpdateSettingsMutationResult =
	Apollo.MutationResult<UpdateSettingsMutation>;
export type UpdateSettingsMutationOptions = Apollo.BaseMutationOptions<
	UpdateSettingsMutation,
	UpdateSettingsMutationVariables
>;
export const UpdateSubscriptionDocument = gql`
	mutation updateSubscription($id: ID!) {
		updateSubscription(id: $id) {
			id
			status
		}
	}
`;
export type UpdateSubscriptionMutationFn = Apollo.MutationFunction<
	UpdateSubscriptionMutation,
	UpdateSubscriptionMutationVariables
>;

/**
 * __useUpdateSubscriptionMutation__
 *
 * To run a mutation, you first call `useUpdateSubscriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSubscriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSubscriptionMutation, { data, loading, error }] = useUpdateSubscriptionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUpdateSubscriptionMutation(
	baseOptions?: Apollo.MutationHookOptions<
		UpdateSubscriptionMutation,
		UpdateSubscriptionMutationVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useMutation<
		UpdateSubscriptionMutation,
		UpdateSubscriptionMutationVariables
	>(UpdateSubscriptionDocument, options);
}
export type UpdateSubscriptionMutationHookResult = ReturnType<
	typeof useUpdateSubscriptionMutation
>;
export type UpdateSubscriptionMutationResult =
	Apollo.MutationResult<UpdateSubscriptionMutation>;
export type UpdateSubscriptionMutationOptions = Apollo.BaseMutationOptions<
	UpdateSubscriptionMutation,
	UpdateSubscriptionMutationVariables
>;
export const GetConnectionDocument = gql`
	query getConnection($type: ProviderType!) {
		connection(type: $type) {
			__typename
			... on DiscordConnection {
				id
				provider
				settings {
					channels {
						id
						name
					}
					channelId
					guildName
					id
				}
			}
			... on TikTokConnection {
				id
				provider
			}
			... on GoogleConnection {
				id
				provider
			}
		}
	}
`;

/**
 * __useGetConnectionQuery__
 *
 * To run a query within a React component, call `useGetConnectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetConnectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetConnectionQuery({
 *   variables: {
 *      type: // value for 'type'
 *   },
 * });
 */
export function useGetConnectionQuery(
	baseOptions: Apollo.QueryHookOptions<
		GetConnectionQuery,
		GetConnectionQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useQuery<GetConnectionQuery, GetConnectionQueryVariables>(
		GetConnectionDocument,
		options
	);
}
export function useGetConnectionLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		GetConnectionQuery,
		GetConnectionQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useLazyQuery<GetConnectionQuery, GetConnectionQueryVariables>(
		GetConnectionDocument,
		options
	);
}
export type GetConnectionQueryHookResult = ReturnType<
	typeof useGetConnectionQuery
>;
export type GetConnectionLazyQueryHookResult = ReturnType<
	typeof useGetConnectionLazyQuery
>;
export type GetConnectionQueryResult = Apollo.QueryResult<
	GetConnectionQuery,
	GetConnectionQueryVariables
>;
export function refetchGetConnectionQuery(
	variables?: GetConnectionQueryVariables
) {
	return {query: GetConnectionDocument, variables: variables};
}
export const ConnectionsDocument = gql`
	query connections {
		connections {
			__typename
			... on DiscordConnection {
				id
				provider
				settings {
					channels {
						id
						name
					}
					channelId
					guildName
					id
				}
			}
			... on TikTokConnection {
				id
				provider
			}
			... on GoogleConnection {
				id
				provider
			}
		}
	}
`;

/**
 * __useConnectionsQuery__
 *
 * To run a query within a React component, call `useConnectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useConnectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useConnectionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useConnectionsQuery(
	baseOptions?: Apollo.QueryHookOptions<
		ConnectionsQuery,
		ConnectionsQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useQuery<ConnectionsQuery, ConnectionsQueryVariables>(
		ConnectionsDocument,
		options
	);
}
export function useConnectionsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		ConnectionsQuery,
		ConnectionsQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useLazyQuery<ConnectionsQuery, ConnectionsQueryVariables>(
		ConnectionsDocument,
		options
	);
}
export type ConnectionsQueryHookResult = ReturnType<typeof useConnectionsQuery>;
export type ConnectionsLazyQueryHookResult = ReturnType<
	typeof useConnectionsLazyQuery
>;
export type ConnectionsQueryResult = Apollo.QueryResult<
	ConnectionsQuery,
	ConnectionsQueryVariables
>;
export function refetchConnectionsQuery(variables?: ConnectionsQueryVariables) {
	return {query: ConnectionsDocument, variables: variables};
}
export const GetCompositionTemplatesDocument = gql`
	query getCompositionTemplates {
		compositionTemplates {
			id
			layers {
				blocks {
					blur {
						value
					}
					crop {
						mode
						value {
							height
							width
							x
							y
						}
					}
				}
				name
				state {
					height
					width
					x
					y
				}
			}
			outputType
			reference {
				id
				size {
					height
					width
				}
			}
			size {
				height
				width
			}
			state {
				durationInFrames
				framesPerSecond
				layers {
					content
					crop {
						reference {
							height
							width
						}
						value {
							height
							width
							x
							y
						}
					}
					durationInFrames
					endAt
					endFrame
					name
					state {
						height
						width
						x
						y
					}
					source {
						id
						file
						fileType
						framesPerSecond
						name
						numberOfFrames
						size {
							height
							width
						}
					}
					startFrame
					startFrom
					style
					type
					volume
				}
				size {
					height
					width
				}
				style
			}
			thumbnail
			title
		}
	}
`;

/**
 * __useGetCompositionTemplatesQuery__
 *
 * To run a query within a React component, call `useGetCompositionTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompositionTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompositionTemplatesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCompositionTemplatesQuery(
	baseOptions?: Apollo.QueryHookOptions<
		GetCompositionTemplatesQuery,
		GetCompositionTemplatesQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useQuery<
		GetCompositionTemplatesQuery,
		GetCompositionTemplatesQueryVariables
	>(GetCompositionTemplatesDocument, options);
}
export function useGetCompositionTemplatesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		GetCompositionTemplatesQuery,
		GetCompositionTemplatesQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useLazyQuery<
		GetCompositionTemplatesQuery,
		GetCompositionTemplatesQueryVariables
	>(GetCompositionTemplatesDocument, options);
}
export type GetCompositionTemplatesQueryHookResult = ReturnType<
	typeof useGetCompositionTemplatesQuery
>;
export type GetCompositionTemplatesLazyQueryHookResult = ReturnType<
	typeof useGetCompositionTemplatesLazyQuery
>;
export type GetCompositionTemplatesQueryResult = Apollo.QueryResult<
	GetCompositionTemplatesQuery,
	GetCompositionTemplatesQueryVariables
>;
export function refetchGetCompositionTemplatesQuery(
	variables?: GetCompositionTemplatesQueryVariables
) {
	return {query: GetCompositionTemplatesDocument, variables: variables};
}
export const GetCompositionDocument = gql`
	query getComposition($id: ID!) {
		composition(id: $id) {
			id
			progress
			state {
				durationInFrames
				framesPerSecond
				layers {
					content
					crop {
						reference {
							height
							width
						}
						value {
							height
							width
							x
							y
						}
					}
					durationInFrames
					endAt
					endFrame
					name
					state {
						height
						width
						x
						y
					}
					source {
						id
						file
						fileType
						framesPerSecond
						name
						numberOfFrames
						size {
							height
							width
						}
					}
					startFrame
					startFrom
					style
					type
					volume
				}
				size {
					height
					width
				}
				style
			}
			status
			title
		}
	}
`;

/**
 * __useGetCompositionQuery__
 *
 * To run a query within a React component, call `useGetCompositionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompositionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompositionQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCompositionQuery(
	baseOptions: Apollo.QueryHookOptions<
		GetCompositionQuery,
		GetCompositionQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useQuery<GetCompositionQuery, GetCompositionQueryVariables>(
		GetCompositionDocument,
		options
	);
}
export function useGetCompositionLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		GetCompositionQuery,
		GetCompositionQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useLazyQuery<GetCompositionQuery, GetCompositionQueryVariables>(
		GetCompositionDocument,
		options
	);
}
export type GetCompositionQueryHookResult = ReturnType<
	typeof useGetCompositionQuery
>;
export type GetCompositionLazyQueryHookResult = ReturnType<
	typeof useGetCompositionLazyQuery
>;
export type GetCompositionQueryResult = Apollo.QueryResult<
	GetCompositionQuery,
	GetCompositionQueryVariables
>;
export function refetchGetCompositionQuery(
	variables?: GetCompositionQueryVariables
) {
	return {query: GetCompositionDocument, variables: variables};
}
export const GetCompositionsDocument = gql`
	query getCompositions(
		$after: String
		$before: String
		$first: Int
		$last: Int
	) {
		compositions(after: $after, before: $before, first: $first, last: $last) {
			edges {
				node {
					id
					status
					progress
					thumbnail
					title
					video
				}
			}
			pageInfo {
				endCursor
				hasNextPage
			}
		}
	}
`;

/**
 * __useGetCompositionsQuery__
 *
 * To run a query within a React component, call `useGetCompositionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompositionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompositionsQuery({
 *   variables: {
 *      after: // value for 'after'
 *      before: // value for 'before'
 *      first: // value for 'first'
 *      last: // value for 'last'
 *   },
 * });
 */
export function useGetCompositionsQuery(
	baseOptions?: Apollo.QueryHookOptions<
		GetCompositionsQuery,
		GetCompositionsQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useQuery<GetCompositionsQuery, GetCompositionsQueryVariables>(
		GetCompositionsDocument,
		options
	);
}
export function useGetCompositionsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		GetCompositionsQuery,
		GetCompositionsQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useLazyQuery<
		GetCompositionsQuery,
		GetCompositionsQueryVariables
	>(GetCompositionsDocument, options);
}
export type GetCompositionsQueryHookResult = ReturnType<
	typeof useGetCompositionsQuery
>;
export type GetCompositionsLazyQueryHookResult = ReturnType<
	typeof useGetCompositionsLazyQuery
>;
export type GetCompositionsQueryResult = Apollo.QueryResult<
	GetCompositionsQuery,
	GetCompositionsQueryVariables
>;
export function refetchGetCompositionsQuery(
	variables?: GetCompositionsQueryVariables
) {
	return {query: GetCompositionsDocument, variables: variables};
}
export const GetFileUploadsDocument = gql`
	query getFileUploads(
		$after: String
		$before: String
		$first: Int
		$last: Int
		$type: UploadType!
	) {
		fileUploads(
			after: $after
			before: $before
			first: $first
			last: $last
			type: $type
		) {
			edges {
				node {
					id
					file
					fileType
					framesPerSecond
					name
					numberOfFrames
					size {
						height
						width
					}
					thumbnail
				}
			}
			pageInfo {
				endCursor
				hasNextPage
			}
		}
	}
`;

/**
 * __useGetFileUploadsQuery__
 *
 * To run a query within a React component, call `useGetFileUploadsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFileUploadsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFileUploadsQuery({
 *   variables: {
 *      after: // value for 'after'
 *      before: // value for 'before'
 *      first: // value for 'first'
 *      last: // value for 'last'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useGetFileUploadsQuery(
	baseOptions: Apollo.QueryHookOptions<
		GetFileUploadsQuery,
		GetFileUploadsQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useQuery<GetFileUploadsQuery, GetFileUploadsQueryVariables>(
		GetFileUploadsDocument,
		options
	);
}
export function useGetFileUploadsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		GetFileUploadsQuery,
		GetFileUploadsQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useLazyQuery<GetFileUploadsQuery, GetFileUploadsQueryVariables>(
		GetFileUploadsDocument,
		options
	);
}
export type GetFileUploadsQueryHookResult = ReturnType<
	typeof useGetFileUploadsQuery
>;
export type GetFileUploadsLazyQueryHookResult = ReturnType<
	typeof useGetFileUploadsLazyQuery
>;
export type GetFileUploadsQueryResult = Apollo.QueryResult<
	GetFileUploadsQuery,
	GetFileUploadsQueryVariables
>;
export function refetchGetFileUploadsQuery(
	variables?: GetFileUploadsQueryVariables
) {
	return {query: GetFileUploadsDocument, variables: variables};
}
export const GetMeDocument = gql`
	query getMe {
		me {
			displayName
			id
			hasCompositions
			subscription {
				currentPeriodEnd
				id
				status
			}
			webSocketToken
		}
	}
`;

/**
 * __useGetMeQuery__
 *
 * To run a query within a React component, call `useGetMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMeQuery(
	baseOptions?: Apollo.QueryHookOptions<GetMeQuery, GetMeQueryVariables>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useQuery<GetMeQuery, GetMeQueryVariables>(
		GetMeDocument,
		options
	);
}
export function useGetMeLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<GetMeQuery, GetMeQueryVariables>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useLazyQuery<GetMeQuery, GetMeQueryVariables>(
		GetMeDocument,
		options
	);
}
export type GetMeQueryHookResult = ReturnType<typeof useGetMeQuery>;
export type GetMeLazyQueryHookResult = ReturnType<typeof useGetMeLazyQuery>;
export type GetMeQueryResult = Apollo.QueryResult<
	GetMeQuery,
	GetMeQueryVariables
>;
export function refetchGetMeQuery(variables?: GetMeQueryVariables) {
	return {query: GetMeDocument, variables: variables};
}
export const GetPresignedUrlDocument = gql`
	query getPresignedUrl($name: String!, $type: String!) {
		getPresignedUrl(name: $name, type: $type) {
			key
			url
		}
	}
`;

/**
 * __useGetPresignedUrlQuery__
 *
 * To run a query within a React component, call `useGetPresignedUrlQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPresignedUrlQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPresignedUrlQuery({
 *   variables: {
 *      name: // value for 'name'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useGetPresignedUrlQuery(
	baseOptions: Apollo.QueryHookOptions<
		GetPresignedUrlQuery,
		GetPresignedUrlQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useQuery<GetPresignedUrlQuery, GetPresignedUrlQueryVariables>(
		GetPresignedUrlDocument,
		options
	);
}
export function useGetPresignedUrlLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		GetPresignedUrlQuery,
		GetPresignedUrlQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useLazyQuery<
		GetPresignedUrlQuery,
		GetPresignedUrlQueryVariables
	>(GetPresignedUrlDocument, options);
}
export type GetPresignedUrlQueryHookResult = ReturnType<
	typeof useGetPresignedUrlQuery
>;
export type GetPresignedUrlLazyQueryHookResult = ReturnType<
	typeof useGetPresignedUrlLazyQuery
>;
export type GetPresignedUrlQueryResult = Apollo.QueryResult<
	GetPresignedUrlQuery,
	GetPresignedUrlQueryVariables
>;
export function refetchGetPresignedUrlQuery(
	variables?: GetPresignedUrlQueryVariables
) {
	return {query: GetPresignedUrlDocument, variables: variables};
}
export const RecentStreamDocument = gql`
	query recentStream {
		recentStream {
			id
			clips {
				id
				game {
					id
					name
					twitchId
				}
				thumbnail
				title
			}
			endTime
			startTime
		}
	}
`;

/**
 * __useRecentStreamQuery__
 *
 * To run a query within a React component, call `useRecentStreamQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecentStreamQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecentStreamQuery({
 *   variables: {
 *   },
 * });
 */
export function useRecentStreamQuery(
	baseOptions?: Apollo.QueryHookOptions<
		RecentStreamQuery,
		RecentStreamQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useQuery<RecentStreamQuery, RecentStreamQueryVariables>(
		RecentStreamDocument,
		options
	);
}
export function useRecentStreamLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		RecentStreamQuery,
		RecentStreamQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useLazyQuery<RecentStreamQuery, RecentStreamQueryVariables>(
		RecentStreamDocument,
		options
	);
}
export type RecentStreamQueryHookResult = ReturnType<
	typeof useRecentStreamQuery
>;
export type RecentStreamLazyQueryHookResult = ReturnType<
	typeof useRecentStreamLazyQuery
>;
export type RecentStreamQueryResult = Apollo.QueryResult<
	RecentStreamQuery,
	RecentStreamQueryVariables
>;
export function refetchRecentStreamQuery(
	variables?: RecentStreamQueryVariables
) {
	return {query: RecentStreamDocument, variables: variables};
}
export const GetCompositionTemplatesWithCategoriesDocument = gql`
	query getCompositionTemplatesWithCategories {
		compositionTemplates {
			categories {
				id
				game {
					id
					imageUrl
					name
					twitchId
				}
			}
			fallback
			id
			thumbnail
			title
		}
	}
`;

/**
 * __useGetCompositionTemplatesWithCategoriesQuery__
 *
 * To run a query within a React component, call `useGetCompositionTemplatesWithCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompositionTemplatesWithCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompositionTemplatesWithCategoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCompositionTemplatesWithCategoriesQuery(
	baseOptions?: Apollo.QueryHookOptions<
		GetCompositionTemplatesWithCategoriesQuery,
		GetCompositionTemplatesWithCategoriesQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useQuery<
		GetCompositionTemplatesWithCategoriesQuery,
		GetCompositionTemplatesWithCategoriesQueryVariables
	>(GetCompositionTemplatesWithCategoriesDocument, options);
}
export function useGetCompositionTemplatesWithCategoriesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		GetCompositionTemplatesWithCategoriesQuery,
		GetCompositionTemplatesWithCategoriesQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useLazyQuery<
		GetCompositionTemplatesWithCategoriesQuery,
		GetCompositionTemplatesWithCategoriesQueryVariables
	>(GetCompositionTemplatesWithCategoriesDocument, options);
}
export type GetCompositionTemplatesWithCategoriesQueryHookResult = ReturnType<
	typeof useGetCompositionTemplatesWithCategoriesQuery
>;
export type GetCompositionTemplatesWithCategoriesLazyQueryHookResult =
	ReturnType<typeof useGetCompositionTemplatesWithCategoriesLazyQuery>;
export type GetCompositionTemplatesWithCategoriesQueryResult =
	Apollo.QueryResult<
		GetCompositionTemplatesWithCategoriesQuery,
		GetCompositionTemplatesWithCategoriesQueryVariables
	>;
export function refetchGetCompositionTemplatesWithCategoriesQuery(
	variables?: GetCompositionTemplatesWithCategoriesQueryVariables
) {
	return {
		query: GetCompositionTemplatesWithCategoriesDocument,
		variables: variables,
	};
}
export const SearchTwitchCategoriesDocument = gql`
	query searchTwitchCategories($input: String!) {
		searchCategories(input: $input) {
			id
			imageUrl
			name
		}
	}
`;

/**
 * __useSearchTwitchCategoriesQuery__
 *
 * To run a query within a React component, call `useSearchTwitchCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchTwitchCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchTwitchCategoriesQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSearchTwitchCategoriesQuery(
	baseOptions: Apollo.QueryHookOptions<
		SearchTwitchCategoriesQuery,
		SearchTwitchCategoriesQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useQuery<
		SearchTwitchCategoriesQuery,
		SearchTwitchCategoriesQueryVariables
	>(SearchTwitchCategoriesDocument, options);
}
export function useSearchTwitchCategoriesLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		SearchTwitchCategoriesQuery,
		SearchTwitchCategoriesQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useLazyQuery<
		SearchTwitchCategoriesQuery,
		SearchTwitchCategoriesQueryVariables
	>(SearchTwitchCategoriesDocument, options);
}
export type SearchTwitchCategoriesQueryHookResult = ReturnType<
	typeof useSearchTwitchCategoriesQuery
>;
export type SearchTwitchCategoriesLazyQueryHookResult = ReturnType<
	typeof useSearchTwitchCategoriesLazyQuery
>;
export type SearchTwitchCategoriesQueryResult = Apollo.QueryResult<
	SearchTwitchCategoriesQuery,
	SearchTwitchCategoriesQueryVariables
>;
export function refetchSearchTwitchCategoriesQuery(
	variables?: SearchTwitchCategoriesQueryVariables
) {
	return {query: SearchTwitchCategoriesDocument, variables: variables};
}
export const SettingsDocument = gql`
	query settings {
		settings {
			automationEnabled
			manageUrl
			streamSummary
		}
	}
`;

/**
 * __useSettingsQuery__
 *
 * To run a query within a React component, call `useSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSettingsQuery({
 *   variables: {
 *   },
 * });
 */
export function useSettingsQuery(
	baseOptions?: Apollo.QueryHookOptions<SettingsQuery, SettingsQueryVariables>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useQuery<SettingsQuery, SettingsQueryVariables>(
		SettingsDocument,
		options
	);
}
export function useSettingsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		SettingsQuery,
		SettingsQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useLazyQuery<SettingsQuery, SettingsQueryVariables>(
		SettingsDocument,
		options
	);
}
export type SettingsQueryHookResult = ReturnType<typeof useSettingsQuery>;
export type SettingsLazyQueryHookResult = ReturnType<
	typeof useSettingsLazyQuery
>;
export type SettingsQueryResult = Apollo.QueryResult<
	SettingsQuery,
	SettingsQueryVariables
>;
export function refetchSettingsQuery(variables?: SettingsQueryVariables) {
	return {query: SettingsDocument, variables: variables};
}
export const TwitchClipDocument = gql`
	query twitchClip($url: String!) {
		twitchClip(url: $url) {
			id
			game {
				id
				name
				twitchId
			}
			thumbnail
			title
			videoUrl
		}
	}
`;

/**
 * __useTwitchClipQuery__
 *
 * To run a query within a React component, call `useTwitchClipQuery` and pass it any options that fit your needs.
 * When your component renders, `useTwitchClipQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTwitchClipQuery({
 *   variables: {
 *      url: // value for 'url'
 *   },
 * });
 */
export function useTwitchClipQuery(
	baseOptions: Apollo.QueryHookOptions<
		TwitchClipQuery,
		TwitchClipQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useQuery<TwitchClipQuery, TwitchClipQueryVariables>(
		TwitchClipDocument,
		options
	);
}
export function useTwitchClipLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		TwitchClipQuery,
		TwitchClipQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useLazyQuery<TwitchClipQuery, TwitchClipQueryVariables>(
		TwitchClipDocument,
		options
	);
}
export type TwitchClipQueryHookResult = ReturnType<typeof useTwitchClipQuery>;
export type TwitchClipLazyQueryHookResult = ReturnType<
	typeof useTwitchClipLazyQuery
>;
export type TwitchClipQueryResult = Apollo.QueryResult<
	TwitchClipQuery,
	TwitchClipQueryVariables
>;
export function refetchTwitchClipQuery(variables?: TwitchClipQueryVariables) {
	return {query: TwitchClipDocument, variables: variables};
}
export const TwitchClipsDocument = gql`
	query twitchClips($startTime: DateTime!, $endTime: DateTime!) {
		twitchClips(startTime: $startTime, endTime: $endTime) {
			id
			game {
				id
				name
				twitchId
			}
			thumbnail
			title
		}
	}
`;

/**
 * __useTwitchClipsQuery__
 *
 * To run a query within a React component, call `useTwitchClipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTwitchClipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTwitchClipsQuery({
 *   variables: {
 *      startTime: // value for 'startTime'
 *      endTime: // value for 'endTime'
 *   },
 * });
 */
export function useTwitchClipsQuery(
	baseOptions: Apollo.QueryHookOptions<
		TwitchClipsQuery,
		TwitchClipsQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useQuery<TwitchClipsQuery, TwitchClipsQueryVariables>(
		TwitchClipsDocument,
		options
	);
}
export function useTwitchClipsLazyQuery(
	baseOptions?: Apollo.LazyQueryHookOptions<
		TwitchClipsQuery,
		TwitchClipsQueryVariables
	>
) {
	const options = {...defaultOptions, ...baseOptions};
	return Apollo.useLazyQuery<TwitchClipsQuery, TwitchClipsQueryVariables>(
		TwitchClipsDocument,
		options
	);
}
export type TwitchClipsQueryHookResult = ReturnType<typeof useTwitchClipsQuery>;
export type TwitchClipsLazyQueryHookResult = ReturnType<
	typeof useTwitchClipsLazyQuery
>;
export type TwitchClipsQueryResult = Apollo.QueryResult<
	TwitchClipsQuery,
	TwitchClipsQueryVariables
>;
export function refetchTwitchClipsQuery(variables?: TwitchClipsQueryVariables) {
	return {query: TwitchClipsDocument, variables: variables};
}
