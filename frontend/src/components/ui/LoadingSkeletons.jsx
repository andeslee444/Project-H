import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Healthcare-themed loading skeletons
export const HealthcareSkeletons = {
  // Patient Card Skeleton
  PatientCard: () => (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <Skeleton circle width={60} height={60} />
          <div className="flex-1">
            <Skeleton width="60%" height={20} className="mb-2" />
            <Skeleton width="40%" height={16} />
          </div>
        </div>
        <div className="mt-4">
          <Skeleton width="100%" height={16} className="mb-2" />
          <Skeleton width="80%" height={16} />
        </div>
      </div>
    </SkeletonTheme>
  ),

  // Appointment Card Skeleton
  AppointmentCard: () => (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Skeleton width="70%" height={18} className="mb-2" />
            <Skeleton width="50%" height={14} className="mb-1" />
            <Skeleton width="40%" height={14} />
          </div>
          <Skeleton width={60} height={24} />
        </div>
      </div>
    </SkeletonTheme>
  ),

  // Schedule Grid Skeleton
  ScheduleGrid: () => (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 21 }, (_, i) => (
          <div key={i} className="p-4 bg-white rounded border">
            <Skeleton width="100%" height={60} />
          </div>
        ))}
      </div>
    </SkeletonTheme>
  ),

  // Provider Card Skeleton
  ProviderCard: () => (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <div className="text-center">
          <Skeleton circle width={80} height={80} className="mx-auto mb-4" />
          <Skeleton width="60%" height={20} className="mb-2 mx-auto" />
          <Skeleton width="40%" height={16} className="mb-4 mx-auto" />
        </div>
        <div className="space-y-2">
          <Skeleton width="100%" height={14} />
          <Skeleton width="80%" height={14} />
          <Skeleton width="90%" height={14} />
        </div>
      </div>
    </SkeletonTheme>
  ),

  // Chart Skeleton
  Chart: () => (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <Skeleton width="40%" height={24} className="mb-6" />
        <Skeleton width="100%" height={200} />
      </div>
    </SkeletonTheme>
  ),

  // Table Row Skeleton
  TableRow: ({ columns = 5 }) => (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <tr>
        {Array.from({ length: columns }, (_, i) => (
          <td key={i} className="px-6 py-4">
            <Skeleton width="80%" height={16} />
          </td>
        ))}
      </tr>
    </SkeletonTheme>
  ),

  // Dashboard Stats Skeleton
  StatsCard: () => (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Skeleton width="60%" height={16} className="mb-2" />
            <Skeleton width="40%" height={32} />
          </div>
          <Skeleton circle width={48} height={48} />
        </div>
      </div>
    </SkeletonTheme>
  ),

  // Form Skeleton
  Form: () => (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div className="space-y-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i}>
            <Skeleton width="30%" height={16} className="mb-2" />
            <Skeleton width="100%" height={40} />
          </div>
        ))}
        <Skeleton width="20%" height={40} />
      </div>
    </SkeletonTheme>
  ),

  // Generic Loading Component
  Generic: ({ lines = 3, className = "" }) => (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div className={className}>
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton 
            key={i} 
            width={i === lines - 1 ? "60%" : "100%"} 
            height={16} 
            className="mb-2" 
          />
        ))}
      </div>
    </SkeletonTheme>
  )
};

export default HealthcareSkeletons;