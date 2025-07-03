/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";

// Import KaTeX for LaTeX rendering
import "katex/dist/katex.min.css";
import { ExerciseList } from "./ExerciseEditorUI";
import { ExerciseForm } from "./ExerciseForm";
import { ExercisePreview } from "./ExercisePreview";
import { useAuth } from "../../contexts/AuthContext";

export const ExerciseEditor: React.FC = () => {
  interface Exercise {
    id?: number;
    name: string;
    subject: string;
    grade: number;
    deadline: string;
    note: string;
    content: string;
    latexContent: string;
    createdBy: number;
    createdAt: string;
    submissions: number;
    status: string;
  }

  const { user, isTeacher } = useAuth();
  const [currentView, setCurrentView] = useState<
    "list" | "create" | "edit" | "preview"
  >("list");
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  // Filter exercises to show only those created by current teacher
  const exercises = useMemo(() => {
    if (!isTeacher || !user) return allExercises;

    // For now, using mock data but in real app this would be an API call
    // with createdBy filter
    return allExercises.filter((exercise) => exercise.createdBy === user.email);
  }, [isTeacher, user, allExercises]);
  const [editMode, setEditMode] = useState<"rich" | "latex">("rich");

  // Form state
  const [formData, setFormData] = useState<Exercise>({
    name: "",
    subject: "Mathematics",
    grade: 6,
    deadline: "",
    note: "",
    content: "",
    latexContent: "",
    createdBy: user?.email || "Admin",
    createdAt: new Date().toISOString().split("T")[0],
    submissions: 0,
    status: "active",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (selectedExercise) {
      setAllExercises((prev) =>
        prev.map((ex) =>
          ex.id === selectedExercise.id
            ? { ...formData, id: selectedExercise.id }
            : ex
        )
      );
    } else {
      const newExercise = {
        ...formData,
        id: Math.max(...allExercises.map((ex) => ex.id)) + 1,
        createdBy: user?.email || "Admin", // Set current user as creator
      };
      setAllExercises((prev) => [...prev, newExercise]);
    }
    setCurrentView("list");
    resetForm();
  };

  const handleEdit = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setFormData(exercise);
    setCurrentView("edit");
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài tập này?")) {
      setAllExercises((prev) => prev.filter((ex) => ex.id !== id));
    }
  };

  const handlePreview = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setFormData(exercise);
    setCurrentView("preview");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "Mathematics",
      grade: 6,
      deadline: "",
      note: "",
      content: "",
      latexContent: "",
      createdBy: user?.email || "Admin",
      createdAt: new Date().toISOString().split("T")[0],
      submissions: 0,
      status: "active",
    });
    setSelectedExercise(null);
  };

  // List View
  if (currentView === "list") {
    return (
      <div className="p-8">
        <ExerciseList
          exercises={exercises}
          onEdit={handleEdit}
          onPreview={handlePreview}
          onDelete={handleDelete}
          onCreateNew={() => setCurrentView("create")}
        />
      </div>
    );
  }

  // Create/Edit View
  if (currentView === "create" || currentView === "edit") {
    return (
      <div className="p-8">
        <ExerciseForm
          formData={formData}
          onInputChange={handleInputChange}
          onSave={handleSave}
          onCancel={() => setCurrentView("list")}
          isEdit={currentView === "edit"}
          editMode={editMode}
          onEditModeChange={setEditMode}
        />
      </div>
    );
  }

  // Preview View
  if (currentView === "preview") {
    return (
      <div className="p-8">
        <ExercisePreview
          exercise={formData}
          onBack={() => setCurrentView("list")}
          onEdit={() => setCurrentView("edit")}
          isReadOnly={false}
        />
      </div>
    );
  }

  return null;
};
