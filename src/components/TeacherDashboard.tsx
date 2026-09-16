import React, { useState, useMemo, useEffect } from 'react';
import { UserProgress } from '../types';
import { authEngine } from '../engine/authEngine';
import { teacherService } from '../services/teacherService';
import { TeacherView, StudentRecord } from './teacher/types';
import { TeacherShell } from './teacher/TeacherShell';
import { TeacherOverview } from './teacher/TeacherOverview';
import { TeacherStudentsList } from './teacher/TeacherStudentsList';
import { TeacherStudentProfile } from './teacher/TeacherStudentProfile';
import { TeacherCompetencies } from './teacher/TeacherCompetencies';
import { TeacherPerformance } from './teacher/TeacherPerformance';
import { TeacherAchievements } from './teacher/TeacherAchievements';
import { TeacherReports } from './teacher/TeacherReports';
import { TeacherSettings } from './teacher/TeacherSettings';
import { ExportModal } from './teacher/ExportModal';

interface TeacherDashboardProps {
  userProgress: UserProgress;
  onProgressUpdate: (updated: UserProgress) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  userProgress,
  onProgressUpdate,
}) => {
  // Controle de Visualização / Sub-Rotas do Modo Professor
  const [currentView, setCurrentView] = useState<TeacherView>('overview');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<StudentRecord | null>(null);

  const classCode = userProgress.classCode || 'VOL-TURMA-2026';
  const schoolName = userProgress.schoolName || 'E.E. Prof. Darcy Ribeiro';

  // Obter lista atualizada de estudantes da turma combinando sessão, contas salvas e turma base
  const students = useMemo(() => {
    const savedAccounts = authEngine.getSavedAccounts();
    return teacherService.getStudentsForClass(classCode, userProgress, savedAccounts);
  }, [classCode, userProgress]);

  // KPIs agregados da turma
  const kpis = useMemo(() => {
    return teacherService.calculateClassKpis(students);
  }, [students]);

  // Resumo das 4 competências BNCC
  const competencies = useMemo(() => {
    return teacherService.calculateCompetenciesSummary(students);
  }, [students]);

  // Estudante atualmente selecionado para detalhamento
  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Handlers de Navegação
  const handleNavigate = (view: TeacherView) => {
    setCurrentView(view);
    if (view !== 'student-detail') {
      setSelectedStudentId(null);
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentView('student-detail');
  };

  const handleSelectCompetency = (competencyId: string) => {
    setCurrentView('competencies');
  };

  const handlePrintStudentReport = (student: StudentRecord) => {
    setSelectedStudentForReport(student);
    setCurrentView('reports');
  };

  const handleExportCsv = () => {
    teacherService.exportClassToCsv(classCode, schoolName, students);
  };

  const handleExportPdf = (type: 'class' | 'student' | 'competencies', studentId?: string) => {
    if (studentId) {
      const std = students.find((s) => s.id === studentId);
      if (std) setSelectedStudentForReport(std);
    }
    setCurrentView('reports');
    // Acionar impressão nativa do navegador após breve transição de tela
    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.warn('Impressão de PDF não suportada neste contexto:', e);
      }
    }, 300);
  };

  const handleChangeClassCode = (newCode: string) => {
    onProgressUpdate({
      ...userProgress,
      classCode: newCode,
    });
  };

  return (
    <TeacherShell
      currentView={currentView}
      onNavigate={handleNavigate}
      classCode={classCode}
      onChangeClassCode={handleChangeClassCode}
      schoolName={schoolName}
      totalStudents={kpis.totalStudents}
      attentionCount={kpis.attentionCount}
      onOpenExportModal={() => setIsExportModalOpen(true)}
    >
      {/* 1. VISÃO GERAL (DASHBOARD PRINCIPAL) */}
      {currentView === 'overview' && (
        <TeacherOverview
          kpis={kpis}
          competencies={competencies}
          students={students}
          classCode={classCode}
          schoolName={schoolName}
          onNavigate={handleNavigate}
          onSelectStudent={handleSelectStudent}
          onSelectCompetency={handleSelectCompetency}
        />
      )}

      {/* 2. LISTA E GESTÃO DE ALUNOS */}
      {currentView === 'students' && (
        <TeacherStudentsList
          students={students}
          onSelectStudent={handleSelectStudent}
          classCode={classCode}
        />
      )}

      {/* 3. PERFIL INDIVIDUAL DO ALUNO */}
      {currentView === 'student-detail' && selectedStudent && (
        <TeacherStudentProfile
          student={selectedStudent}
          onBack={() => handleNavigate('students')}
          onPrintStudentReport={handlePrintStudentReport}
        />
      )}

      {/* 4. MATRIZ DE COMPETÊNCIAS */}
      {currentView === 'competencies' && (
        <TeacherCompetencies
          competencies={competencies}
          onSelectStudent={handleSelectStudent}
        />
      )}

      {/* 5. ANÁLISE DE DESEMPENHO E EVOLUÇÃO */}
      {currentView === 'performance' && (
        <TeacherPerformance
          students={students}
          competencies={competencies}
          kpis={kpis}
          classCode={classCode}
          onSelectStudent={handleSelectStudent}
        />
      )}

      {/* 6. MURAL DE CONQUISTAS DA TURMA */}
      {currentView === 'achievements' && (
        <TeacherAchievements
          students={students}
          onSelectStudent={handleSelectStudent}
        />
      )}

      {/* 7. CENTRAL DE RELATÓRIOS OFICIAIS */}
      {currentView === 'reports' && (
        <TeacherReports
          students={students}
          competencies={competencies}
          kpis={kpis}
          classCode={classCode}
          schoolName={schoolName}
          onExportCsv={handleExportCsv}
          selectedStudentForReport={selectedStudentForReport}
        />
      )}

      {/* 8. CONFIGURAÇÕES DA TURMA */}
      {currentView === 'settings' && (
        <TeacherSettings
          userProgress={userProgress}
          onProgressUpdate={onProgressUpdate}
          onRefreshData={() => {}}
        />
      )}

      {/* MODAL DE EXPORTAÇÃO */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        students={students}
        classCode={classCode}
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
      />
    </TeacherShell>
  );
};
