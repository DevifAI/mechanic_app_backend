import { DataTypes } from 'sequelize';

export const OrganisationModel = (sequelize) => {
  const OrganisationModel = sequelize.define(
    'organisation',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      org_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      org_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      org_image: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue:
          'https://bcassetcdn.com/public/blog/wp-content/uploads/2022/09/01203355/blue-building-circle-by-simplepixelsl-brandcrowd.png',
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  return OrganisationModel;
};
