export interface EmployeeRaw {
  headers: string[]
  rows: (string | number | boolean | null)[][]
}

export interface Employee {
  EmployeeID: string | null
  Full_Name: string | null
  Gender: string | null
  Age: number | null
  Department: string | null
  JobTitle: string | null
  City: string | null
  Salary: number | null
  Marital_Status: string | null
  EducationLevel: string | null
  PerformanceRating: number | null
  Attrition: boolean | null
  YearsAtCompany: number | null
  OverTime: boolean | null
  TrainingHoursLastYear: number | null
  Work_Mode: string | null
  SatisfactionScore: number | null
  Employment_Status: string | null
  HireDate: string | null
  [key: string]: string | number | boolean | null
}

export interface ModelMetrics {
  accuracy: number
  precision: number
  recall: number
  f1: number
  auc: number
  confusion_matrix: number[][]
  train_size: number
  test_size: number
}

export interface AttritionModel {
  feature_names: string[]
  coef: number[]
  intercept: number
  scaler_mean: number[]
  scaler_scale: number[]
  metrics: ModelMetrics
  num_cols: string[]
  bool_cols: string[]
  cat_cols: string[]
  cat_values: Record<string, string[]>
  num_medians: Record<string, number>
  roc_points: number[][]
}

export interface PredictionInput {
  Age: number
  YearsAtCompany: number
  TrainingHoursLastYear: number
  SatisfactionScore: number
  PerformanceRating: number
  OverTime: boolean
  Department: string
  Work_Mode: string
  Marital_Status: string
  EducationLevel: string
  Gender: string
  City: string
  [key: string]: string | number | boolean
}

export interface Contribution {
  feature: string
  contribution: number
}
