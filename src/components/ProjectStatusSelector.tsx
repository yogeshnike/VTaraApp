import React from 'react';

type ProjectStatus = 'Not-Started' | 'In-Progress' | 'Completed';

interface ProjectStatusSelectorProps {
  currentStatus: ProjectStatus;
  onStatusChange: (status: ProjectStatus) => void;
}

const statusColors = {
  'Not-Started': 'bg-gray-100 text-gray-700',
  'In-Progress': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700'
};

export function ProjectStatusSelector({ currentStatus, onStatusChange }: ProjectStatusSelectorProps) {
  return (
    <select
      value={currentStatus}
      onChange={(e) => onStatusChange(e.target.value as ProjectStatus)}
      className={`${statusColors[currentStatus]} px-3 py-1 rounded-md border cursor-pointer text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500`}
    >
      <option value="Not-Started">Not Started</option>
      <option value="In-Progress">In Progress</option>
      <option value="Completed">Completed</option>
    </select>
  );
}