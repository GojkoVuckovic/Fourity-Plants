"use client";
import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Image from "next/image";

const entityFields = [
  { label: "UUID", value: "uuid" },
  { label: "Plant UUID", value: "plantUuid" },
  { label: "Employee Name", value: "employeeName" },
  { label: "Is Water", value: "isWater" },
  { label: "Is Sun", value: "isSun" },
  { label: "Date", value: "date" },
  { label: "Resolved", value: "resolved" },
];

interface PlantRecordTableProps {
  plantRecords: PlantRecordDto[];
  loading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

interface PlantDto {
  uuid: string;
  name: string;
  additionalInfo: string;
  imageUrl?: string;
  imageAlt?: string;
  sunRequirement: number;
  waterRequirement: number;
  lastTimeWatered: string;
  lastTimeSunlit: string;
}

export const PlantRecordTable: React.FC<PlantRecordTableProps> = ({
  plantRecords = [],
  loading = false,
  error = null,
  onLoadMore,
  hasMore = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<PlantDto | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const fetchPlantDetails = async (plantUuid: string) => {
    try {
      setModalLoading(true);
      setModalError(null);

      const response = await fetch("/api/bff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: {
            command: "getPlant",
            payload: { uuid: plantUuid },
          },
        }),
      });

      if (!response.ok) {
        // Check for 500 status
        if (response.status === 500) {
          throw new Error("No plant available");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.data) {
        setSelectedPlant(result.data);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      console.error("Error fetching plant details:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenModal = async (plantUuid: string) => {
    setIsModalOpen(true);
    setSelectedPlant(null);
    setModalError(null);
    await fetchPlantDetails(plantUuid);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlant(null);
    setModalError(null);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  useEffect(() => {
    const table = tableRef.current;
    if (!table || !hasMore || loading) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = table;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        onLoadMore?.();
      }
    };

    table.addEventListener("scroll", handleScroll);
    return () => table.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, onLoadMore]);

  return (
    <ScrollArea className="h-[70vh] w-full rounded-md border" ref={tableRef}>
      {loading && plantRecords.length === 0 ? (
        <div className="p-4 text-center">
          <Skeleton className="h-4 w-[200px] mx-auto" />
        </div>
      ) : plantRecords.length === 0 ? (
        <div className="p-4 text-center">No plant records available.</div>
      ) : (
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              {entityFields.map((field) => (
                <TableHead key={field.value} className="text-center">
                  {field.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {plantRecords.map((plantRecord) => (
              <TableRow key={`${plantRecord.uuid}-${plantRecord.date}`}>
                {entityFields.map((field) => (
                  <TableCell
                    key={`${plantRecord.uuid}-${field.value}`}
                    className="text-center"
                  >
                    {field.value === "plantUuid" ? (
                      <Button
                        variant="link"
                        onClick={() => handleOpenModal(plantRecord.plantUuid)}
                        className="p-0 h-auto"
                      >
                        {plantRecord.plantUuid}
                      </Button>
                    ) : field.value === "isWater" ||
                      field.value === "isSun" ||
                      field.value === "resolved" ? (
                      <Badge
                        variant={
                          plantRecord[field.value] ? "default" : "destructive"
                        }
                      >
                        {plantRecord[field.value] ? "Yes" : "No"}
                      </Badge>
                    ) : field.value === "date" ? (
                      new Date(plantRecord.date).toLocaleDateString()
                    ) : (
                      plantRecord[field.value as keyof PlantRecordDto] || "N/A"
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {loading && plantRecords.length > 0 && (
        <div className="p-4 text-center">
          <Skeleton className="h-4 w-[200px] mx-auto" />
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Plant Details</DialogTitle>
          </DialogHeader>

          {modalLoading && !selectedPlant && (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {modalError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {modalError.includes("No plant available")
                  ? "No plant available"
                  : "Error loading plant details"}
              </AlertDescription>
            </Alert>
          )}

          {selectedPlant && !modalError && (
            <div className="space-y-4">
              <Card className="relative aspect-video overflow-hidden">
                <Image
                  src={
                    `/api/public/${selectedPlant.uuid}.webp` || "/no_plant.webp"
                  }
                  alt="This plant does not have a picture :("
                  fill={true}
                  className="absolute inset-0 w-full h-full object-cover"
                  key={`/${selectedPlant.uuid}.webp`}
                />
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Name</h3>
                  <p>{selectedPlant.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Move to sun</h3>
                  <p>Every {selectedPlant.sunRequirement} days</p>
                </div>
                <div>
                  <h3 className="font-semibold">Water Requirement</h3>
                  <p>Every {selectedPlant.waterRequirement} days</p>
                </div>
                <div>
                  <h3 className="font-semibold">Last Watered</h3>
                  <p>
                    {new Date(selectedPlant.lastTimeWatered).toDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Last Sunlit</h3>
                  <p>{new Date(selectedPlant.lastTimeSunlit).toDateString()}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold">Additional Info</h3>
                <p className="whitespace-pre-line">
                  {selectedPlant.additionalInfo}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
};

export type PlantRecordDto = {
  uuid: string;
  plantUuid: string;
  employeeName: string;
  isWater: boolean;
  isSun: boolean;
  date: string;
  resolved: boolean;
};
