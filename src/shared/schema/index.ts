// Base types and enums
export {
  RatingSchema,
  type Rating,
  QualitativeCaptureSchema,
  type QualitativeCapture,
  SentimentSchema,
  type Sentiment,
  UserTypeSchema,
  type UserType,
  UseCaseSubjectSchema,
  type UseCaseSubject,
  DifficultyLevelSchema,
  type DifficultyLevel,
  CoursePartPreferenceSchema,
  type CoursePartPreference,
} from "./base.js";

// Question schemas
export {
  RecordAiBackgroundSchema,
  type RecordAiBackground,
  RecordOverallImpressionSchema,
  type RecordOverallImpression,
  RecordPerceivedContentSchema,
  type RecordPerceivedContent,
  RecordDifficultySchema,
  type RecordDifficulty,
  RecordContentQualitySchema,
  type RecordContentQuality,
  RecordPresentationSchema,
  type RecordPresentation,
  RecordClaritySchema,
  type RecordClarity,
  RecordSuggestionsSchema,
  type RecordSuggestions,
  RecordCoursePartsSchema,
  type RecordCourseParts,
  QuestionId,
  QUESTION_IDS,
  TOTAL_QUESTIONS,
} from "./questions.js";

// Progress tracking
export {
  QuestionCompletionSchema,
  type QuestionCompletion,
  ProgressStateSchema,
  type ProgressState,
  CollectedResponsesSchema,
  type CollectedResponses,
  InterviewProgressSchema,
  type InterviewProgress,
  createEmptyProgress,
  countCompletedQuestions,
  isInterviewComplete,
  getRemainingQuestions,
  getCompletedQuestions,
  // Response API types
  ResponseSourceSchema,
  type ResponseSource,
  TopicResponseSchema,
  type TopicResponse,
  InterviewResponsesDTOSchema,
  type InterviewResponsesDTO,
  // Tool helpers
  toolNameToQuestionId,
} from "./progress.js";
