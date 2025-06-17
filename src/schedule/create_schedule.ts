interface PlantRecord {
	id: number;
	plant_id: number;
	employee_name: string;
	isWater: boolean;
	isSun: boolean;
	date: string;
	resolved: boolean;
	additionalInfo?: string;
}
