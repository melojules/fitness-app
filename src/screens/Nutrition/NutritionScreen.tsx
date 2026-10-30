import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { FoodEntry, MealType } from '../../models/types';
import { useProfile } from '../../state/ProfileContext';
import { colors, fontFamily, layout, radius, spacing, type } from '../../theme';

const MEALS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

function localDay(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function MacroBar({ label, value, target, unit = 'g' }: { label: string; value: number; target: number; unit?: string }) {
  const ratio = Math.min(value / Math.max(target, 1), 1);
  return <View style={styles.macroBlock}>
    <View style={styles.rowBetween}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{Math.round(value)} / {Math.round(target)}{unit}</Text>
    </View>
    <View style={styles.track}><View style={[styles.fill, { width: `${ratio * 100}%` }]} /></View>
  </View>;
}

export function NutritionScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { latestMetrics, foodEntries, addFoodEntry, removeFoodEntry } = useProfile();
  const [showAdd, setShowAdd] = useState(false);
  const [meal, setMeal] = useState<MealType>('breakfast');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [error, setError] = useState('');
  const now = new Date();
  const todayKey = localDay(now.toISOString());

  const todayEntries = useMemo(
    () => foodEntries.filter((entry) => localDay(entry.loggedAt) === todayKey),
    [foodEntries, todayKey]
  );
  const totals = useMemo(() => todayEntries.reduce((sum, entry) => ({
    calories: sum.calories + entry.calories,
    protein: sum.protein + entry.proteinG,
    carbs: sum.carbs + entry.carbsG,
    fat: sum.fat + entry.fatG,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 }), [todayEntries]);

  const calorieTarget = latestMetrics?.calorieTarget ?? 2000;
  const weightKg = latestMetrics?.weightKg ?? 70;
  const proteinTarget = Math.round(weightKg * 1.6);
  const fatTarget = Math.round(weightKg * 0.8);
  const carbsTarget = Math.max(80, Math.round((calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4));
  const remaining = Math.max(0, calorieTarget - totals.calories);

  const suggestions = useMemo(() => {
    const items: string[] = [];
    if (proteinTarget - totals.protein >= 25) items.push('Add a protein anchor: chicken, fish, tofu, eggs, beans, or Greek yogurt.');
    if (carbsTarget - totals.carbs >= 40) items.push('For training fuel, add rice, oats, potatoes, fruit, or whole-grain bread.');
    if (fatTarget - totals.fat >= 15) items.push('For healthy fats, add nuts, seeds, avocado, olive oil, or oily fish.');
    if (remaining <= 150) items.push('You are close to today’s calorie target. Choose water and a light, high-fiber option if still hungry.');
    return items.slice(0, 3);
  }, [totals, proteinTarget, carbsTarget, fatTarget, remaining]);

  function resetForm() {
    setName(''); setCalories(''); setProtein(''); setCarbs(''); setFat(''); setError('');
  }

  function saveFood() {
    const parsed = [calories, protein, carbs, fat].map(Number);
    if (!name.trim()) return setError('Enter the food or meal name.');
    if (parsed.some((value) => !Number.isFinite(value) || value < 0) || parsed[0] <= 0) {
      return setError('Enter valid calories and macro amounts. Use 0 when a macro is unknown.');
    }
    const entry: FoodEntry = {
      id: `food_${Date.now()}`,
      loggedAt: new Date().toISOString(),
      name: name.trim(),
      meal,
      calories: parsed[0],
      proteinG: parsed[1],
      carbsG: parsed[2],
      fatG: parsed[3],
    };
    addFoodEntry(entry);
    resetForm();
    setShowAdd(false);
  }

  return <SafeAreaView style={styles.safe} edges={['top']}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={navigation.goBack} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={type.screenTitle}>Today’s nutrition</Text>
          <Text style={styles.subtitle}>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>
      </View>

      <Card style={styles.heroCard}>
        <Text style={type.eyebrow}>CALORIES REMAINING</Text>
        <Text style={styles.heroNumber}>{remaining}</Text>
        <Text style={styles.heroSub}>{Math.round(totals.calories)} logged · {calorieTarget} target</Text>
      </Card>

      <Card style={styles.macroCard}>
        <MacroBar label="Protein" value={totals.protein} target={proteinTarget} />
        <MacroBar label="Carbs" value={totals.carbs} target={carbsTarget} />
        <MacroBar label="Fat" value={totals.fat} target={fatTarget} />
      </Card>

      <Card style={styles.suggestionCard}>
        <Text style={type.cardTitle}>What to prioritize next</Text>
        {suggestions.map((suggestion, index) => <View key={suggestion} style={styles.suggestionRow}>
          <Text style={styles.rank}>{index + 1}</Text><Text style={styles.suggestionText}>{suggestion}</Text>
        </View>)}
        <Text style={styles.disclaimer}>Targets are estimates from your profile, not medical advice. Food labels and portions can vary.</Text>
      </Card>

      <View style={styles.rowBetween}><Text style={type.cardTitle}>Today’s food</Text><Text style={styles.count}>{todayEntries.length} items</Text></View>
      {todayEntries.length === 0 ? <Card><Text style={styles.empty}>Nothing logged yet. Add your first meal or snack.</Text></Card> :
        MEALS.map(({ value, label }) => {
          const entries = todayEntries.filter((entry) => entry.meal === value);
          if (!entries.length) return null;
          return <Card key={value} padded={false}>
            <Text style={styles.mealTitle}>{label}</Text>
            {entries.map((entry, index) => <View key={entry.id} style={[styles.foodRow, index > 0 && styles.divider]}>
              <View style={{ flex: 1 }}><Text style={styles.foodName}>{entry.name}</Text><Text style={styles.foodMeta}>{entry.proteinG}g P · {entry.carbsG}g C · {entry.fatG}g F</Text></View>
              <View style={styles.foodRight}><Text style={styles.foodCalories}>{entry.calories} kcal</Text>
                <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${entry.name}`} onPress={() => Alert.alert('Remove food?', entry.name, [
                  { text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => removeFoodEntry(entry.id) },
                ])} style={styles.removeButton}><Text style={styles.removeText}>Remove</Text></Pressable>
              </View>
            </View>)}
          </Card>;
        })}
      <PrimaryButton label="Add food" onPress={() => setShowAdd(true)} />
    </ScrollView>

    <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAdd(false)}>
      <SafeAreaView style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
          <View style={styles.rowBetween}><Text style={type.screenTitle}>Add food</Text>
            <Pressable accessibilityRole="button" onPress={() => { resetForm(); setShowAdd(false); }} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable>
          </View>
          <Text style={styles.fieldLabel}>Meal</Text>
          <View style={styles.mealPicker}>{MEALS.map((option) => <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected: meal === option.value }} onPress={() => setMeal(option.value)} style={[styles.mealChip, meal === option.value && styles.mealChipActive]}><Text style={[styles.mealChipText, meal === option.value && styles.mealChipTextActive]}>{option.label}</Text></Pressable>)}</View>
          <LabeledInput label="Food or meal name" value={name} onChangeText={setName} placeholder="Chicken rice bowl" />
          <LabeledInput label="Calories" value={calories} onChangeText={setCalories} keyboardType="decimal-pad" placeholder="520" />
          <View style={styles.inputRow}>
            <LabeledInput compact label="Protein (g)" value={protein} onChangeText={setProtein} keyboardType="decimal-pad" placeholder="35" />
            <LabeledInput compact label="Carbs (g)" value={carbs} onChangeText={setCarbs} keyboardType="decimal-pad" placeholder="60" />
            <LabeledInput compact label="Fat (g)" value={fat} onChangeText={setFat} keyboardType="decimal-pad" placeholder="14" />
          </View>
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <PrimaryButton label="Save food" onPress={saveFood} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </SafeAreaView>;
}

function LabeledInput({ label, compact, ...props }: React.ComponentProps<typeof TextInput> & { label: string; compact?: boolean }) {
  return <View style={compact ? styles.compactInput : undefined}><Text style={styles.fieldLabel}>{label}</Text><TextInput {...props} accessibilityLabel={label} placeholderTextColor={colors.inkFaint} style={styles.input} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.gutter, paddingTop: spacing.md, paddingBottom: 48, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backButton: { width: layout.hitTarget, height: layout.hitTarget, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.accentLight, fontSize: 34, lineHeight: 38 },
  subtitle: { color: colors.inkMuted, fontFamily: fontFamily.medium, fontSize: 13.5, marginTop: 2 },
  heroCard: { backgroundColor: colors.accentDeep, gap: 5 },
  heroNumber: { color: '#FFFFFF', fontFamily: fontFamily.extrabold, fontSize: 48, letterSpacing: -1.6 },
  heroSub: { color: '#FFFFFF', fontFamily: fontFamily.medium, fontSize: 14 },
  macroCard: { gap: spacing.lg }, macroBlock: { gap: 7 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  macroLabel: { color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 },
  macroValue: { color: colors.inkMuted, fontFamily: fontFamily.mono, fontSize: 11.5 },
  track: { height: 7, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.accent },
  suggestionCard: { gap: spacing.md }, suggestionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  rank: { width: 24, height: 24, borderRadius: 12, textAlign: 'center', textAlignVertical: 'center', color: colors.accentLight, backgroundColor: colors.accentWash15, fontFamily: fontFamily.bold, fontSize: 12 },
  suggestionText: { flex: 1, color: colors.ink, fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 21 },
  disclaimer: { color: colors.inkMuted, fontFamily: fontFamily.regular, fontSize: 12.5, lineHeight: 19 },
  count: { color: colors.inkMuted, fontFamily: fontFamily.mono, fontSize: 11 },
  empty: { color: colors.inkMuted, fontFamily: fontFamily.medium, fontSize: 14 },
  mealTitle: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, color: colors.inkFaint, fontFamily: fontFamily.mono, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase' },
  foodRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  divider: { borderTopWidth: 1, borderTopColor: colors.hairline },
  foodName: { color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 15 },
  foodMeta: { color: colors.inkMuted, fontFamily: fontFamily.mono, fontSize: 10.5, marginTop: 4 },
  foodRight: { alignItems: 'flex-end' }, foodCalories: { color: colors.ink, fontFamily: fontFamily.mono, fontSize: 12 },
  removeButton: { minHeight: 44, justifyContent: 'center' }, removeText: { color: colors.live, fontFamily: fontFamily.semibold, fontSize: 12 },
  sheet: { flex: 1, backgroundColor: colors.surfaceRaised }, sheetContent: { padding: spacing.xxl, gap: spacing.lg },
  cancelButton: { minWidth: 60, minHeight: 44, justifyContent: 'center', alignItems: 'flex-end' }, cancelText: { color: colors.accentLight, fontFamily: fontFamily.semibold, fontSize: 15 },
  fieldLabel: { color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13, marginBottom: 7 },
  input: { minHeight: 52, borderRadius: radius.field, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, color: colors.ink, fontFamily: fontFamily.medium, fontSize: 16, paddingHorizontal: 14 },
  inputRow: { flexDirection: 'row', gap: spacing.sm }, compactInput: { flex: 1 },
  mealPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  mealChip: { minHeight: 44, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  mealChipActive: { borderColor: colors.accent, backgroundColor: colors.accentWash15 },
  mealChipText: { color: colors.inkMuted, fontFamily: fontFamily.semibold, fontSize: 13 }, mealChipTextActive: { color: colors.accentLight },
  error: { color: colors.ink, fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 21 },
});
