import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddAttendance } from "@/components/attendance/add-attendance";
import { ATTENDANCE_STATUS } from "@/lib/constants";
import { getAttendance, getEmployees } from "@/lib/data";
import { CalendarCheck, Moon, UserX, Plane } from "lucide-react";

export const metadata = { title: "Attendance · Emerging ERP" };

export default async function AttendancePage() {
  const [attendance, employees] = await Promise.all([getAttendance(), getEmployees()]);
  const present = attendance.filter((a) => a.status === "present").length;
  const night = attendance.filter((a) => a.status === "night_shift").length;
  const leave = attendance.filter((a) => a.status === "leave").length;
  const absent = attendance.filter((a) => a.status === "absent").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Daily attendance, shifts and leave — marked manually by HR/Admin.">
        <AddAttendance employees={employees.map((e) => ({ id: e.id, full_name: e.full_name }))} />
      </PageHeader>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Present" value={present} icon={<CalendarCheck />} />
        <StatCard label="Night Shift" value={night} icon={<Moon />} />
        <StatCard label="On Leave" value={leave} icon={<Plane />} />
        <StatCard label="Absent" value={absent} icon={<UserX />} />
      </div>
      {attendance.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck />}
          title="No attendance marked yet"
          description="Use “Mark Attendance” to record present, leave, night-shift or absent for each employee."
        />
      ) : (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead className="text-right">Total Hours</TableHead>
                <TableHead className="text-right">Late</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.employee_name}</TableCell>
                  <TableCell className="text-sm text-steel">{a.date}</TableCell>
                  <TableCell className="text-sm text-steel">{a.check_in ?? "—"}</TableCell>
                  <TableCell className="text-sm text-steel">{a.check_out ?? "—"}</TableCell>
                  <TableCell className="text-right">{a.total_hours ?? "—"}</TableCell>
                  <TableCell className="text-right text-sm">
                    {a.late_minutes ? <span className="text-warning">{a.late_minutes}m</span> : "—"}
                  </TableCell>
                  <TableCell><StatusBadge status={ATTENDANCE_STATUS[a.status]} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
