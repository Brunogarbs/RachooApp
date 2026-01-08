-- DropForeignKey
ALTER TABLE "Divisao" DROP CONSTRAINT "Divisao_gastoId_fkey";

-- DropForeignKey
ALTER TABLE "Divisao" DROP CONSTRAINT "Divisao_pessoaId_fkey";

-- DropForeignKey
ALTER TABLE "Gasto" DROP CONSTRAINT "Gasto_eventoId_fkey";

-- DropForeignKey
ALTER TABLE "Gasto" DROP CONSTRAINT "Gasto_pagoPorId_fkey";

-- DropForeignKey
ALTER TABLE "Pessoa" DROP CONSTRAINT "Pessoa_eventoId_fkey";

-- AddForeignKey
ALTER TABLE "Pessoa" ADD CONSTRAINT "Pessoa_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_pagoPorId_fkey" FOREIGN KEY ("pagoPorId") REFERENCES "Pessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Divisao" ADD CONSTRAINT "Divisao_gastoId_fkey" FOREIGN KEY ("gastoId") REFERENCES "Gasto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Divisao" ADD CONSTRAINT "Divisao_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
