import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  VideoCameraIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  FolderOpenIcon,
  PlayIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  XMarkIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../i18n/index.jsx";

const StudentELearning = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("courses");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [onlineCourses, setOnlineCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showSubmissionModal, setShowSubmissionModal] = useState(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch online courses available to student
      const [onlineRes] = await Promise.all([
        api.get("/elearning/courses/student"),
      ]);
      setOnlineCourses(onlineRes.data.courses || []);

      // Get student's enrolled courses
      if (user?.student?.id) {
        try {
          const enrolledRes = await api.get(
            `/students/${user.student.id}/courses`,
          );
          setEnrolledCourses(enrolledRes.data.data || []);
        } catch (e) {
          console.error("Failed to fetch enrolled courses:", e);
          setEnrolledCourses([]);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaterials = async (courseId) => {
    try {
      const response = await api.get(`/elearning/materials/course/${courseId}`);
      setMaterials(response.data.materials || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
      setMaterials([]);
    }
  };

  const fetchQuizzes = async (courseId) => {
    try {
      const response = await api.get(`/elearning/quizzes/course/${courseId}`);
      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setQuizzes([]);
    }
  };

  const fetchAssignments = async (courseId) => {
    try {
      const response = await api.get(
        `/elearning/assignments/course/${courseId}`,
      );
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments([]);
    }
  };

  const handleCourseChange = (courseId) => {
    const course = enrolledCourses.find(
      (c) => (c.course_id || c.class?.course_id) === parseInt(courseId),
    );
    setSelectedCourse(course);
    if (courseId) {
      fetchMaterials(courseId);
      fetchQuizzes(courseId);
      fetchAssignments(courseId);
    }
  };

  const joinCourse = async (courseId) => {
    try {
      const response = await api.post(`/elearning/courses/${courseId}/join`);
      if (response.data.meeting_url) {
        window.open(response.data.meeting_url, "_blank");
        toast.success(t('joining_live_course'));
      }
    } catch (error) {
      toast.error(error.response?.data?.error || t('error'));
    }
  };

  const downloadMaterial = async (materialId, fileName) => {
    try {
      const response = await api.get(
        `/elearning/materials/${materialId}/download`,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(t('download_started'));
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const startQuiz = async (quizId) => {
    try {
      const response = await api.post(`/elearning/quizzes/${quizId}/start`);
      setActiveQuiz({
        ...response.data,
        quizId,
      });
      setQuizAnswers({});
    } catch (error) {
      toast.error(
        error.response?.data?.error || t('error'),
      );
    }
  };

  const submitQuiz = async () => {
    try {
      const response = await api.post(
        `/elearning/quizzes/attempt/${activeQuiz.attempt_id}/submit`,
        {
          answers: quizAnswers,
        },
      );
      const passed = response.data.passed;
      toast[passed ? "success" : "error"](
        `Quiz terminé! Score: ${response.data.score?.toFixed(1)}/${response.data.total_points} - ${passed ? "Réussi!" : "Échec"}`,
      );
      setActiveQuiz(null);
      if (selectedCourse)
        fetchQuizzes(
          selectedCourse.course_id || selectedCourse.class?.course_id,
        );
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const tabs = [
    {
      id: "courses",
      name: "Cours en Ligne",
      icon: VideoCameraIcon,
      count: onlineCourses.length,
    },
    {
      id: "materials",
      name: "Documents",
      icon: DocumentTextIcon,
      count: materials.length,
    },
    {
      id: "quizzes",
      name: "Quiz",
      icon: ClipboardDocumentListIcon,
      count: quizzes.length,
    },
    {
      id: "assignments",
      name: "Devoirs",
      icon: FolderOpenIcon,
      count: assignments.length,
    },
  ];

  // Quiz Modal Component
  const QuizModal = () => {
    const [timeLeft, setTimeLeft] = useState(
      activeQuiz.quiz.duration_minutes * 60,
    );
    const [currentQuestion, setCurrentQuestion] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const question = activeQuiz.questions[currentQuestion];
    const answeredCount = Object.keys(quizAnswers).length;

    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-300 rounded-2xl w-full max-w-3xl overflow-hidden"
        >
          {/* Quiz Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg">{activeQuiz.quiz.title}</h2>
                <p className="text-sm opacity-80">
                  Question {currentQuestion + 1} sur{" "}
                  {activeQuiz.questions.length}
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`text-3xl font-bold font-mono ${timeLeft < 60 ? "text-red-300 animate-pulse" : ""}`}
                >
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm opacity-80">Temps restant</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 dark:bg-dark-100">
            <div
              className="h-full bg-primary-500 transition-all"
              style={{
                width: `${((currentQuestion + 1) / activeQuiz.questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question */}
          <div className="p-6">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-3">
                {question.points} point{question.points > 1 ? "s" : ""}
              </span>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {question.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {question.type === "multiple_choice" &&
                question.options?.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      quizAnswers[question.id] === option
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-gray-200 dark:border-dark-100 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={quizAnswers[question.id] === option}
                      onChange={() =>
                        setQuizAnswers({
                          ...quizAnswers,
                          [question.id]: option,
                        })
                      }
                      className="w-5 h-5 text-primary-500"
                    />
                    <span className="text-gray-900 dark:text-white">
                      {option}
                    </span>
                  </label>
                ))}

              {question.type === "true_false" && (
                <div className="flex gap-4">
                  {["vrai", "faux"].map((option) => (
                    <label
                      key={option}
                      className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        quizAnswers[question.id] === option
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-200 dark:border-dark-100 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={quizAnswers[question.id] === option}
                        onChange={() =>
                          setQuizAnswers({
                            ...quizAnswers,
                            [question.id]: option,
                          })
                        }
                        className="w-5 h-5 text-primary-500"
                      />
                      <span className="text-gray-900 dark:text-white font-medium capitalize">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === "short_answer" && (
                <input
                  type="text"
                  value={quizAnswers[question.id] || ""}
                  onChange={(e) =>
                    setQuizAnswers({
                      ...quizAnswers,
                      [question.id]: e.target.value,
                    })
                  }
                  placeholder="Votre réponse..."
                  className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-dark-100 bg-transparent text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-500 mb-2">
              Navigation des questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {activeQuiz.questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQuestion(i)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    currentQuestion === i
                      ? "bg-primary-500 text-white"
                      : quizAnswers[activeQuiz.questions[i].id]
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-dark-100 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {answeredCount} / {activeQuiz.questions.length} questions
              répondues
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="p-4 border-t border-gray-200 dark:border-dark-100 flex justify-between">
            <button
              onClick={() =>
                setCurrentQuestion(Math.max(0, currentQuestion - 1))
              }
              disabled={currentQuestion === 0}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50"
            >
              Précédent
            </button>

            {currentQuestion === activeQuiz.questions.length - 1 ? (
              <button
                onClick={submitQuiz}
                className="px-6 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
              >
                Soumettre le quiz
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentQuestion(
                    Math.min(
                      activeQuiz.questions.length - 1,
                      currentQuestion + 1,
                    ),
                  )
                }
                className="px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
              >
                Suivant
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  // Assignment Submission Modal
  const SubmissionModal = ({ assignment }) => {
    const fileInputRef = useRef(null);
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
      if (!content && !file) {
        toast.error(t('add_content_or_file'));
        return;
      }

      setIsSubmitting(true);
      const formData = new FormData();
      if (content) formData.append("content", content);
      if (file) formData.append("file", file);

      try {
        await api.post(
          `/elearning/assignments/${assignment.id}/submit`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        toast.success(t('assignment_submitted'));
        setShowSubmissionModal(null);
        if (selectedCourse)
          fetchAssignments(
            selectedCourse.course_id || selectedCourse.class?.course_id,
          );
      } catch (error) {
        toast.error(
          error.response?.data?.error || t('error'),
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-300 rounded-2xl w-full max-w-lg overflow-hidden"
        >
          <div className="p-5 border-b border-gray-200 dark:border-dark-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Soumettre le devoir
              </h2>
              <p className="text-sm text-gray-500">{assignment.title}</p>
            </div>
            <button
              onClick={() => setShowSubmissionModal(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commentaire / Réponse
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Écrivez votre réponse ici..."
                className="w-full p-3 rounded-xl bg-gray-100 dark:bg-dark-200 border-0 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fichier (optionnel)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-dark-100 rounded-xl p-6 text-center cursor-pointer hover:border-primary-500 transition-colors"
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <DocumentTextIcon className="w-8 h-8 text-primary-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">
                      Cliquez pour sélectionner un fichier
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Types acceptés:{" "}
                      {assignment.allowed_file_types?.join(", ") ||
                        "pdf, doc, docx"}{" "}
                      (max {assignment.max_file_size_mb || 10}MB)
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                accept={
                  assignment.allowed_file_types
                    ?.map((t) => `.${t}`)
                    .join(",") || ".pdf,.doc,.docx"
                }
                className="hidden"
              />
            </div>

            {assignment.is_overdue && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="text-sm">
                  Ce devoir est en retard. Une pénalité de{" "}
                  {assignment.late_penalty_percent}% sera appliquée.
                </span>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-gray-200 dark:border-dark-100 flex gap-3">
            <button
              onClick={() => setShowSubmissionModal(null)}
              className="flex-1 py-3 bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!content && !file)}
              className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50"
            >
              {isSubmitting ? "Soumission..." : "Soumettre"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="text-center py-12 bg-gray-50 dark:bg-dark-200 rounded-xl">
      <Icon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          E-Learning
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Accédez à vos cours en ligne, documents, quiz et devoirs
        </p>
      </motion.div>

      {/* Course Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sélectionnez un cours
        </label>
        <select
          value={
            selectedCourse?.course_id ||
            selectedCourse?.class?.course_id ||
            ""
          }
          onChange={(e) => handleCourseChange(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-100 dark:bg-dark-200 border-0 text-gray-900 dark:text-white"
        >
          <option value="">-- Sélectionner un cours --</option>
          {enrolledCourses.map((enrollment) => (
            <option
              key={enrollment.id}
              value={enrollment.course_id || enrollment.class?.course_id}
            >
              {enrollment.class?.course?.name ||
                enrollment.course?.name ||
                "Cours"}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 dark:bg-dark-200 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white dark:bg-dark-300 text-primary-600 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.name}</span>
            {tab.count > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {/* Online Courses */}
        {activeTab === "courses" && (() => {
          const selectedCourseId = selectedCourse?.course_id || selectedCourse?.class?.course_id
          const filteredOnlineCourses = selectedCourseId
            ? onlineCourses.filter(c => c.course_id === parseInt(selectedCourseId))
            : onlineCourses
          return (
          <div className="space-y-4">
            {!selectedCourse ? (
              <EmptyState
                icon={VideoCameraIcon}
                title="Sélectionnez un cours"
                description="Choisissez un cours pour voir les sessions en ligne programmées par votre professeur"
              />
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-48 bg-gray-100 dark:bg-dark-200 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : filteredOnlineCourses.length === 0 ? (
              <EmptyState
                icon={VideoCameraIcon}
                title="Aucun cours en ligne disponible"
                description="Vos professeurs n'ont pas encore programmé de cours en ligne"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOnlineCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`p-3 rounded-xl ${course.status === "live" ? "bg-red-100 dark:bg-red-900/30 text-red-600" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"}`}
                      >
                        {course.status === "live" ? (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <VideoCameraIcon className="w-5 h-5" />
                          </div>
                        ) : (
                          <PlayIcon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          course.status === "scheduled"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : course.status === "live"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {course.status === "scheduled"
                          ? "Programmé"
                          : course.status === "live"
                            ? "🔴 En direct"
                            : "Terminé"}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-lg">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {course.course?.name}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                      Prof. {course.teacher?.user?.first_name}{" "}
                      {course.teacher?.user?.last_name}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {course.duration_minutes} min
                      </span>
                      {course.scheduled_at && (
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(course.scheduled_at).toLocaleString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      )}
                    </div>

                    {course.status === "live" && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => joinCourse(course.id)}
                        className="w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <VideoCameraIcon className="w-5 h-5" />
                        Rejoindre le cours
                      </motion.button>
                    )}

                    {course.status === "scheduled" && (
                      <div className="w-full py-3 bg-gray-100 dark:bg-dark-200 text-gray-500 dark:text-gray-400 rounded-xl text-center font-medium">
                        Commence bientôt
                      </div>
                    )}

                    {course.status === "ended" && course.recording_url && (
                      <button className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                        <PlayIcon className="w-5 h-5" />
                        Voir l'enregistrement
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          )
        })()}

        {/* Materials */}
        {activeTab === "materials" && (
          <div className="space-y-4">
            {!selectedCourse ? (
              <EmptyState
                icon={DocumentTextIcon}
                title="Sélectionnez un cours"
                description="Choisissez un cours pour voir les documents disponibles"
              />
            ) : materials.length === 0 ? (
              <EmptyState
                icon={DocumentTextIcon}
                title="Aucun document disponible"
                description="Votre professeur n'a pas encore partagé de documents pour ce cours"
              />
            ) : (
              <div className="space-y-3">
                {materials.map((material) => (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-white dark:bg-dark-200 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {material.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {material.type} •{" "}
                          {material.file_size
                            ? `${(material.file_size / (1024 * 1024)).toFixed(2)} MB`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {material.external_url ? (
                        <button
                          onClick={() =>
                            window.open(material.external_url, "_blank")
                          }
                          className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                        >
                          <PlayIcon className="w-5 h-5" />
                        </button>
                      ) : material.downloadable ? (
                        <button
                          onClick={() =>
                            downloadMaterial(material.id, material.file_name)
                          }
                          className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                        >
                          <ArrowDownTrayIcon className="w-5 h-5" />
                        </button>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quizzes */}
        {activeTab === "quizzes" && (
          <div className="space-y-4">
            {!selectedCourse ? (
              <EmptyState
                icon={ClipboardDocumentListIcon}
                title="Sélectionnez un cours"
                description="Choisissez un cours pour voir les quiz disponibles"
              />
            ) : quizzes.length === 0 ? (
              <EmptyState
                icon={ClipboardDocumentListIcon}
                title="Aucun quiz disponible"
                description="Votre professeur n'a pas encore créé de quiz pour ce cours"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.map((quiz) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <ClipboardDocumentListIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      {quiz.my_attempts > 0 && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Score: {quiz.best_score?.toFixed(1)}/
                          {quiz.total_points}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {quiz.questions?.length || 0} questions •{" "}
                      {quiz.duration_minutes} min
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>
                        <AcademicCapIcon className="w-4 h-4 inline mr-1" />
                        {quiz.total_points} pts
                      </span>
                      <span>
                        Tentatives: {quiz.my_attempts || 0}/{quiz.max_attempts}
                      </span>
                    </div>

                    {quiz.can_attempt ? (
                      <button
                        onClick={() => startQuiz(quiz.id)}
                        className="w-full py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                      >
                        {quiz.my_attempts > 0
                          ? "Réessayer"
                          : "Commencer le quiz"}
                      </button>
                    ) : (
                      <div className="w-full py-2 bg-gray-100 dark:bg-dark-200 text-gray-500 rounded-lg text-sm font-medium text-center">
                        {quiz.my_attempts >= quiz.max_attempts
                          ? "Tentatives épuisées"
                          : "Non disponible"}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assignments */}
        {activeTab === "assignments" && (
          <div className="space-y-4">
            {!selectedCourse ? (
              <EmptyState
                icon={FolderOpenIcon}
                title="Sélectionnez un cours"
                description="Choisissez un cours pour voir les devoirs à rendre"
              />
            ) : assignments.length === 0 ? (
              <EmptyState
                icon={FolderOpenIcon}
                title="Aucun devoir disponible"
                description="Votre professeur n'a pas encore créé de devoir pour ce cours"
              />
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const isOverdue = assignment.is_overdue;
                  const hasSubmitted = assignment.my_submission;

                  return (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div
                            className={`p-3 rounded-xl ${
                              hasSubmitted
                                ? "bg-green-100 dark:bg-green-900/30"
                                : isOverdue
                                  ? "bg-red-100 dark:bg-red-900/30"
                                  : "bg-orange-100 dark:bg-orange-900/30"
                            }`}
                          >
                            {hasSubmitted ? (
                              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                            ) : isOverdue ? (
                              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                            ) : (
                              <FolderOpenIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {assignment.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {assignment.description}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <span className="text-gray-500">
                                <AcademicCapIcon className="w-4 h-4 inline mr-1" />
                                {assignment.total_points} points
                              </span>
                              <span
                                className={
                                  isOverdue && !hasSubmitted
                                    ? "text-red-500"
                                    : "text-gray-500"
                                }
                              >
                                <CalendarIcon className="w-4 h-4 inline mr-1" />
                                {new Date(
                                  assignment.due_date,
                                ).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {hasSubmitted && (
                                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                  <CheckCircleIcon className="w-4 h-4" />
                                  Soumis
                                  {hasSubmitted.grade !== null &&
                                    ` - Note: ${hasSubmitted.grade}/${assignment.total_points}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {assignment.can_submit ? (
                            <button
                              onClick={() => setShowSubmissionModal(assignment)}
                              className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                            >
                              {hasSubmitted ? "Resoumettre" : "Soumettre"}
                            </button>
                          ) : hasSubmitted ? (
                            <button className="px-4 py-2 bg-gray-100 dark:bg-dark-200 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium">
                              Voir soumission
                            </button>
                          ) : (
                            <span className="text-sm text-red-500">
                              Date limite dépassée
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quiz Modal */}
      <AnimatePresence>{activeQuiz && <QuizModal />}</AnimatePresence>

      {/* Submission Modal */}
      <AnimatePresence>
        {showSubmissionModal && (
          <SubmissionModal assignment={showSubmissionModal} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentELearning;
