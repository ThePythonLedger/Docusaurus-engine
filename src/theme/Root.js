import React from 'react';
import { TrackerProvider } from '../context/TrackerContext';

export default function Root({ children }) {
  return <TrackerProvider>{children}</TrackerProvider>;
}