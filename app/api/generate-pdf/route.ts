import { NextRequest, NextResponse } from 'next/server';
import { generatePdfAction } from '@/app/actions/pdf';

export const POST = async (request: NextRequest) => {
  try {
    const declarationData = await request.json();
    
    const pdfData = {
      date: declarationData.date,
      city: declarationData.city,
      state: declarationData.state,
      stamp: declarationData.stamp,
      firstPerson: {
        name: declarationData.firstPerson.name,
        cpf: declarationData.firstPerson.taxpayerId,
        nationality: declarationData.firstPerson.nationality,
        civilStatus: declarationData.firstPerson.civilStatus,
        birthDate: declarationData.firstPerson.birthDate,
        birthPlace: declarationData.firstPerson.birthPlace,
        profession: declarationData.firstPerson.profession,
        rg: declarationData.firstPerson.rg,
        address: declarationData.firstPerson.address,
        email: declarationData.firstPerson.email,
        phone: declarationData.firstPerson.phone,
        fatherName: declarationData.firstPerson.fatherName,
        motherName: declarationData.firstPerson.motherName,
        registryOffice: declarationData.firstPerson.registryOffice,
        registryBook: declarationData.firstPerson.registryBook,
        registryPage: declarationData.firstPerson.registryPage,
        registryTerm: declarationData.firstPerson.registryTerm,
        typeRegistry: 'NASCIMENTO',
        divorceDate: declarationData.firstPerson.divorceDate,
        newName: declarationData.firstPerson.newName,
      },
      secondPerson: {
        name: declarationData.secondPerson.name,
        cpf: declarationData.secondPerson.taxpayerId,
        nationality: declarationData.secondPerson.nationality,
        civilStatus: declarationData.secondPerson.civilStatus,
        birthDate: declarationData.secondPerson.birthDate,
        birthPlace: declarationData.secondPerson.birthPlace,
        profession: declarationData.secondPerson.profession,
        rg: declarationData.secondPerson.rg,
        address: declarationData.secondPerson.address,
        email: declarationData.secondPerson.email,
        phone: declarationData.secondPerson.phone,
        fatherName: declarationData.secondPerson.fatherName,
        motherName: declarationData.secondPerson.motherName,
        registryOffice: declarationData.secondPerson.registryOffice,
        registryBook: declarationData.secondPerson.registryBook,
        registryPage: declarationData.secondPerson.registryPage,
        registryTerm: declarationData.secondPerson.registryTerm,
        typeRegistry: 'NASCIMENTO',
        divorceDate: declarationData.secondPerson.divorceDate,
        newName: declarationData.secondPerson.newName,
      },
      unionStartDate: declarationData.unionStartDate,
      propertyRegime: declarationData.propertyRegime,
      registrarName: declarationData.registrarName,
      pactDate: declarationData.pactDate,
      pactOffice: declarationData.pactOffice,
      pactBook: declarationData.pactBook,
      pactPage: declarationData.pactPage,
      pactTerm: declarationData.pactTerm,
    };

    const result = await generatePdfAction(pdfData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        pdfContent: result.pdfContent,
        filename: result.filename
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
};