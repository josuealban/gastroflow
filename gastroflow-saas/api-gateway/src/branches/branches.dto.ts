import { Transform, Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
export class InitialStaffDto {
  @IsUUID() userId!: string;
  @IsArray() @ArrayUnique() @IsUUID('4', { each: true }) roleIds!: string[];
}
export class CreateBranchDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(3, 100)
  name!: string;
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(2, 20)
  @Matches(/^[A-Z0-9-]+$/)
  code!: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsString() @MaxLength(250) address?: string;
  @IsOptional() @IsString() @MaxLength(100) city?: string;
  @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @IsOptional() @IsLatitude() latitude?: number;
  @IsOptional() @IsLongitude() longitude?: number;
  @IsOptional() @IsUUID() templateBranchId?: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitialStaffDto)
  initialStaff?: InitialStaffDto[];
}
export class UpdateBranchDto {
  @IsOptional() @IsString() @Length(3, 100) name?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsString() @MaxLength(250) address?: string;
  @IsOptional() @IsString() @MaxLength(100) city?: string;
  @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @IsOptional() @IsLatitude() latitude?: number;
  @IsOptional() @IsLongitude() longitude?: number;
}
export class BranchStatusDto {
  @IsEnum(['ACTIVE', 'INACTIVE']) status!: 'ACTIVE' | 'INACTIVE';
}
export class BranchQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional()
  @IsEnum(['PROVISIONING', 'ACTIVE', 'INACTIVE', 'FAILED'])
  status?: string;
  @IsOptional() @IsString() city?: string;
}
