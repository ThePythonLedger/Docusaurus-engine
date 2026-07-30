import React from 'react';
import clsx from 'clsx';


export default function ProgressTracker() {
  const completedLessons = [];
  const [githubToken, setGithubToken] = useState(null);
  const [githubUser, setGithubUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState("not_synced");

  const toggleLessonCompleted = (lessonId) => {
    if (completedLessons.includes(lessonId)) {
      completedLessons.splice(completedLessons.indexOf(lessonId), 1);
    } else {
      completedLessons.push(lessonId);
    }
  };

  const setToken = (token) => {
    setGithubToken(token);
  };

  const clearUserData = () => {
    setGithubToken(null);
    setGithubUser(null);
  };


  return (
    <section>
      <div className="container">
        
      </div>
    </section>
  );
}