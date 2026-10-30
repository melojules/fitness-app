import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { colors, fontFamily, radius, spacing, type } from '../../theme';
import { PillGroup } from '../Onboarding/components/PillGroup';
import { useProfile } from '../../state/ProfileContext';
import { useToast } from '../../components/Toast';
import { getAllExercises, getExercise } from '../../data/exerciseLibrary';
import { muscleLabel } from '../../logic/muscleVolume';
import type { ProgramsStackParamList } from '../../navigation/types';
import type { Difficulty, Equipment, ExerciseLibraryItem, MuscleGroup, Program, ProgramExercise, WorkoutDay } from '../../models/types';
import type { Goal } from '../../screens/Onboarding/types';

const EXPERIENCE_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'build_muscle', label: 'Build muscle' },
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'general_health', label: 'General health' },
];

const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'full_gym', label: 'Full gym' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'bands', label: 'Bands' },
  { value: 'bodyweight', label: 'Bodyweight only' },
  { value: 'machines', label: 'Machines' },
];

const MUSCLE_OPTIONS: { value: MuscleGroup; label: string }[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'calves', 'core', 'full_body',
].map((m) => ({ value: m as MuscleGroup, label: muscleLabel(m as MuscleGroup) }));

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

export function CustomBuilderScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ProgramsStackParamList, 'CustomBuilder'>>();
  const { profile, programs, addCustomProgram, updateCustomProgram, addCustomExercise } = useProfile();
  const { showToast } = useToast();

  const editingProgram = route.params?.programId ? programs.find((p) => p.id === route.params!.programId) : null;

  const [name, setName] = useState(editingProgram?.name ?? '');
  const [days, setDays] = useState<WorkoutDay[]>(editingProgram?.days ?? []);
  const [experience, setExperience] = useState<Difficulty[]>(editingProgram?.experience ?? (profile ? [profile.experience] : ['beginner']));
  const [goals, setGoals] = useState<Goal[]>(editingProgram?.goals ?? (profile ? [profile.goal] : ['general_health']));
  const [equipment, setEquipment] = useState<Equipment[]>(
    (editingProgram?.equipment as Equipment[]) ?? (profile?.equipment as Equipment[]) ?? ['bodyweight']
  );
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);

  function toggleMulti<T>(list: T[], value: T, setList: (v: T[]) => void) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function addDay() {
    const day: WorkoutDay = { id: nextId('day'), name: `Day ${days.length + 1}`, exercises: [] };
    setDays([...days, day]);
    setExpandedDayId(day.id);
  }

  function removeDay(dayId: string) {
    setDays(days.filter((d) => d.id !== dayId));
  }

  function renameDay(dayId: string, newName: string) {
    setDays(days.map((d) => (d.id === dayId ? { ...d, name: newName } : d)));
  }

  function moveDay(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= days.length) return;
    const next = [...days];
    [next[index], next[target]] = [next[target], next[index]];
    setDays(next);
  }

  function addExerciseToDay(dayId: string, exercise: ExerciseLibraryItem) {
    const pe: ProgramExercise = { id: nextId('pe'), exerciseId: exercise.id, sets: 3, reps: '10', restSec: 90 };
    setDays(days.map((d) => (d.id === dayId ? { ...d, exercises: [...d.exercises, pe] } : d)));
  }

  function removeExercise(dayId: string, peId: string) {
    setDays(days.map((d) => (d.id === dayId ? { ...d, exercises: d.exercises.filter((e) => e.id !== peId) } : d)));
  }

  function updateExercise(dayId: string, peId: string, patch: Partial<ProgramExercise>) {
    setDays(
      days.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.map((e) => (e.id === peId ? { ...e, ...patch } : e)) }
          : d
      )
    );
  }

  function moveExercise(dayId: string, index: number, direction: -1 | 1) {
    setDays(
      days.map((d) => {
        if (d.id !== dayId) return d;
        const target = index + direction;
        if (target < 0 || target >= d.exercises.length) return d;
        const next = [...d.exercises];
        [next[index], next[target]] = [next[target], next[index]];
        return { ...d, exercises: next };
      })
    );
  }

  function handleSave() {
    if (!name.trim()) {
      showToast('Give your program a name first');
      return;
    }
    if (days.length === 0) {
      showToast('Add at least one workout day');
      return;
    }
    const program: Program = {
      id: editingProgram?.id ?? nextId('custom'),
      name: name.trim(),
      source: 'custom',
      experience,
      goals,
      daysPerWeek: days.length,
      equipment,
      description: `Custom program with ${days.length} workout day${days.length > 1 ? 's' : ''}.`,
      days,
    };
    if (editingProgram) {
      updateCustomProgram(program);
      showToast('Program updated');
    } else {
      addCustomProgram(program);
      showToast('Program saved');
    }
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.headerAction}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{editingProgram ? 'Edit program' : 'New program'}</Text>
        <Pressable onPress={handleSave}>
          <Text style={[styles.headerAction, styles.saveAction]}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="Program name"
          placeholderTextColor={colors.inkFaint}
        />

        <View style={styles.section}>
          <Text style={type.eyebrow}>EXPERIENCE LEVEL</Text>
          <PillGroup
            options={EXPERIENCE_OPTIONS}
            selected={experience}
            onToggle={(v) => toggleMulti(experience, v, setExperience)}
            multi
          />
        </View>

        <View style={styles.section}>
          <Text style={type.eyebrow}>GOALS</Text>
          <PillGroup options={GOAL_OPTIONS} selected={goals} onToggle={(v) => toggleMulti(goals, v, setGoals)} multi />
        </View>

        <View style={styles.section}>
          <Text style={type.eyebrow}>EQUIPMENT</Text>
          <PillGroup
            options={EQUIPMENT_OPTIONS}
            selected={equipment}
            onToggle={(v) => toggleMulti(equipment, v, setEquipment)}
            multi
          />
        </View>

        <View style={styles.section}>
          <View style={styles.daysHeader}>
            <Text style={type.cardTitle}>Workout days</Text>
          </View>
          <View style={styles.dayList}>
            {days.map((day, index) => (
              <DayEditor
                key={day.id}
                day={day}
                index={index}
                total={days.length}
                expanded={expandedDayId === day.id}
                onToggleExpand={() => setExpandedDayId(expandedDayId === day.id ? null : day.id)}
                onRename={(n) => renameDay(day.id, n)}
                onRemove={() => removeDay(day.id)}
                onMove={(dir) => moveDay(index, dir)}
                onAddExercise={(ex) => addExerciseToDay(day.id, ex)}
                onAddCustomExercise={(ex) => {
                  addCustomExercise(ex);
                  addExerciseToDay(day.id, ex);
                }}
                onRemoveExercise={(peId) => removeExercise(day.id, peId)}
                onUpdateExercise={(peId, patch) => updateExercise(day.id, peId, patch)}
                onMoveExercise={(i, dir) => moveExercise(day.id, i, dir)}
              />
            ))}
            <Pressable style={styles.dashedRow} onPress={addDay}>
              <Text style={styles.dashedText}>+ Add workout day</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DayEditor({
  day,
  index,
  total,
  expanded,
  onToggleExpand,
  onRename,
  onRemove,
  onMove,
  onAddExercise,
  onAddCustomExercise,
  onRemoveExercise,
  onUpdateExercise,
  onMoveExercise,
}: {
  day: WorkoutDay;
  index: number;
  total: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onRename: (name: string) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onAddExercise: (exercise: ExerciseLibraryItem) => void;
  onAddCustomExercise: (exercise: ExerciseLibraryItem) => void;
  onRemoveExercise: (peId: string) => void;
  onUpdateExercise: (peId: string, patch: Partial<ProgramExercise>) => void;
  onMoveExercise: (index: number, dir: -1 | 1) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View style={styles.dayCard}>
      <View style={styles.dayHeaderRow}>
        <View style={styles.dayHandle}>
          <Pressable onPress={() => onMove(-1)} disabled={index === 0} hitSlop={6}>
            <Text style={[styles.moveArrow, index === 0 && styles.moveArrowDisabled]}>▲</Text>
          </Pressable>
          <Pressable onPress={() => onMove(1)} disabled={index === total - 1} hitSlop={6}>
            <Text style={[styles.moveArrow, index === total - 1 && styles.moveArrowDisabled]}>▼</Text>
          </Pressable>
        </View>
        <TextInput style={styles.dayNameInput} value={day.name} onChangeText={onRename} />
        <Pressable onPress={onToggleExpand} hitSlop={8}>
          <Text style={styles.expandToggle}>{expanded ? 'Hide' : `${day.exercises.length} exercises`}</Text>
        </Pressable>
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text style={styles.removeDayText}>✕</Text>
        </Pressable>
      </View>

      {expanded && (
        <View style={styles.dayBody}>
          {day.exercises.map((pe, i) => (
            <ExerciseEditorRow
              key={pe.id}
              programExercise={pe}
              index={i}
              total={day.exercises.length}
              onRemove={() => onRemoveExercise(pe.id)}
              onUpdate={(patch) => onUpdateExercise(pe.id, patch)}
              onMove={(dir) => onMoveExercise(i, dir)}
            />
          ))}

          {showPicker ? (
            <ExercisePicker
              onPick={(ex) => {
                onAddExercise(ex);
                setShowPicker(false);
              }}
              onCreateCustom={(ex) => {
                onAddCustomExercise(ex);
                setShowPicker(false);
              }}
              onCancel={() => setShowPicker(false)}
            />
          ) : (
            <Pressable style={styles.dashedRow} onPress={() => setShowPicker(true)}>
              <Text style={styles.dashedText}>+ Add exercise</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

function ExerciseEditorRow({
  programExercise,
  index,
  total,
  onRemove,
  onUpdate,
  onMove,
}: {
  programExercise: ProgramExercise;
  index: number;
  total: number;
  onRemove: () => void;
  onUpdate: (patch: Partial<ProgramExercise>) => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const exercise = getExercise(programExercise.exerciseId);

  return (
    <View style={styles.exerciseRow}>
      <View style={styles.exerciseRowTop}>
        <Text style={styles.exerciseName} numberOfLines={1}>
          {exercise.name}
        </Text>
        <View style={styles.exerciseRowActions}>
          <Pressable onPress={() => onMove(-1)} disabled={index === 0} hitSlop={6}>
            <Text style={[styles.moveArrowSmall, index === 0 && styles.moveArrowDisabled]}>▲</Text>
          </Pressable>
          <Pressable onPress={() => onMove(1)} disabled={index === total - 1} hitSlop={6}>
            <Text style={[styles.moveArrowSmall, index === total - 1 && styles.moveArrowDisabled]}>▼</Text>
          </Pressable>
          <Pressable onPress={onRemove} hitSlop={6}>
            <Text style={styles.removeDayText}>✕</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.exerciseFields}>
        <FieldStepper label="sets" value={programExercise.sets} onChange={(v) => onUpdate({ sets: v })} min={1} max={10} />
        <TextInput
          style={styles.fieldInput}
          value={programExercise.reps}
          onChangeText={(v) => onUpdate({ reps: v })}
          placeholder="reps"
          placeholderTextColor={colors.inkFaint}
        />
        <FieldStepper
          label="rest(s)"
          value={programExercise.restSec}
          onChange={(v) => onUpdate({ restSec: v })}
          min={0}
          max={300}
          step={15}
        />
      </View>
    </View>
  );
}

function FieldStepper({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <View style={styles.stepperBlock}>
      <Pressable onPress={() => onChange(Math.max(min, value - step))} hitSlop={6}>
        <Text style={styles.stepperBtn}>−</Text>
      </Pressable>
      <Text style={styles.stepperValue}>
        {value}
        <Text style={styles.stepperLabel}> {label}</Text>
      </Text>
      <Pressable onPress={() => onChange(Math.min(max, value + step))} hitSlop={6}>
        <Text style={styles.stepperBtn}>+</Text>
      </Pressable>
    </View>
  );
}

function ExercisePicker({
  onPick,
  onCreateCustom,
  onCancel,
}: {
  onPick: (exercise: ExerciseLibraryItem) => void;
  onCreateCustom: (exercise: ExerciseLibraryItem) => void;
  onCancel: () => void;
}) {
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('chest');
  const [customEquipment, setCustomEquipment] = useState<Equipment>('bodyweight');
  const [customNotes, setCustomNotes] = useState('');

  const results = useMemo(() => {
    const all = getAllExercises();
    if (!search.trim()) return all.slice(0, 8);
    const q = search.toLowerCase();
    return all.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 8);
  }, [search]);

  if (creating) {
    return (
      <View style={styles.pickerPanel}>
        <Text style={type.eyebrow}>CUSTOM EXERCISE</Text>
        <TextInput
          style={styles.fieldInputWide}
          value={customName}
          onChangeText={setCustomName}
          placeholder="Exercise name"
          placeholderTextColor={colors.inkFaint}
        />
        <PillGroup options={MUSCLE_OPTIONS} selected={[customMuscle]} onToggle={(v) => setCustomMuscle(v)} />
        <PillGroup options={EQUIPMENT_OPTIONS} selected={[customEquipment]} onToggle={(v) => setCustomEquipment(v)} />
        <TextInput
          style={styles.fieldInputWide}
          value={customNotes}
          onChangeText={setCustomNotes}
          placeholder="Notes / cues (optional)"
          placeholderTextColor={colors.inkFaint}
        />
        <View style={styles.pickerActions}>
          <Pressable onPress={() => setCreating(false)}>
            <Text style={styles.pickerCancel}>Back</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (!customName.trim()) return;
              const exercise: ExerciseLibraryItem = {
                id: nextId('custom_ex'),
                name: customName.trim(),
                primaryMuscles: [customMuscle],
                secondaryMuscles: [],
                equipment: [customEquipment],
                cues: customNotes.trim() ? [customNotes.trim()] : [],
                difficulty: 'beginner',
                demoTempoSec: 1.8,
              };
              onCreateCustom(exercise);
            }}
          >
            <Text style={styles.pickerConfirm}>Add exercise</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.pickerPanel}>
      <TextInput
        style={styles.fieldInputWide}
        value={search}
        onChangeText={setSearch}
        placeholder="Search exercises"
        placeholderTextColor={colors.inkFaint}
      />
      <View style={styles.pickerResults}>
        {results.map((ex) => (
          <Pressable key={ex.id} style={styles.pickerResultRow} onPress={() => onPick(ex)}>
            <Text style={styles.pickerResultName}>{ex.name}</Text>
            <Text style={styles.pickerResultMeta}>{muscleLabel(ex.primaryMuscles[0])}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.pickerActions}>
        <Pressable onPress={onCancel}>
          <Text style={styles.pickerCancel}>Cancel</Text>
        </Pressable>
        <Pressable onPress={() => setCreating(true)}>
          <Text style={styles.pickerConfirm}>+ New custom exercise</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  headerAction: {
    fontFamily: fontFamily.semibold,
    fontSize: 14.5,
    color: colors.inkMuted,
  },
  saveAction: {
    color: colors.accentLight,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15.5,
    color: colors.ink,
  },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.xl,
  },
  nameInput: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    paddingBottom: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayList: {
    gap: spacing.md,
  },
  dayCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: 'hidden',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  dayHandle: {
    gap: 2,
  },
  moveArrow: {
    fontSize: 10,
    color: colors.inkFaint,
  },
  moveArrowSmall: {
    fontSize: 9,
    color: colors.inkFaint,
  },
  moveArrowDisabled: {
    opacity: 0.25,
  },
  dayNameInput: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: 14.5,
    color: colors.ink,
  },
  expandToggle: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.accentLight,
  },
  removeDayText: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.inkFaint,
  },
  dayBody: {
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: 0,
  },
  exerciseRow: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.field,
    padding: spacing.sm,
    gap: 8,
  },
  exerciseRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseName: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    color: colors.ink,
  },
  exerciseRowActions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  exerciseFields: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  fieldInput: {
    width: 70,
    height: 34,
    borderRadius: radius.chip,
    backgroundColor: colors.surfaceAlt2,
    color: colors.ink,
    fontFamily: fontFamily.mono,
    fontSize: 12.5,
    textAlign: 'center',
  },
  fieldInputWide: {
    height: 38,
    borderRadius: radius.field,
    backgroundColor: colors.surfaceAlt2,
    color: colors.ink,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    paddingHorizontal: spacing.sm,
  },
  stepperBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperBtn: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.accentLight,
    width: 18,
    textAlign: 'center',
  },
  stepperValue: {
    fontFamily: fontFamily.mono,
    fontSize: 12.5,
    color: colors.ink,
  },
  stepperLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 10.5,
    color: colors.inkFaint,
  },
  dashedRow: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  dashedText: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.inkMuted,
  },
  pickerPanel: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pickerResults: {
    gap: 2,
  },
  pickerResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  pickerResultName: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.ink,
  },
  pickerResultMeta: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.inkFaint,
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  pickerCancel: {
    fontFamily: fontFamily.semibold,
    fontSize: 12.5,
    color: colors.inkFaint,
  },
  pickerConfirm: {
    fontFamily: fontFamily.semibold,
    fontSize: 12.5,
    color: colors.accentLight,
  },
});
