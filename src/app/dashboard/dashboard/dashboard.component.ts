import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { DashboardService } from './../dashboard.service';




@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  pieChartData: any;
  lineChartData: any;

  options = {

    tooltips: {

      callbacks: {

        label: (tooltipItem: any, data: any) => {

          const dataset = data.datasets[tooltipItem.datasetIndex];
          const valor = dataset.data[tooltipItem.index];
          const label = dataset.label ? (dataset.label + ': ') : '';

          return label + this.decimalPipe.transform(valor, '1.2-2');

        }

      }

    }

  }

  constructor(
    private dashboardService: DashboardService,
    private decimalPipe: DecimalPipe
  ) { }

  ngOnInit(): void {

    this.configurarGraficoPizza();
    this.configurarGraficoLinhas();

  }

  configurarGraficoPizza() {

    this.dashboardService.listarPorCategoria()
      .then(dados => {

        this.pieChartData = {
          labels: dados.map(dado => dado.categoria.nome),
          datasets: [
            {
              data: dados.map(dado => dado.total),
              backgroundColor: ['#FF9900', '#109618', '#990099', '#3B3EAC', '#3D3DDC']
            }
          ]
        };


      });

  }

  configurarGraficoLinhas() {

    this.dashboardService.listarPorDia()
      .then(dados => {

        const diasDoMes = this.configurarDiasMes(new Date(2021, 5, 1));

        const totaisReceitas = this.totaisPorCadaDiaMes(
          dados.filter(dado => dado.tipo === 'RECEITA'),
          diasDoMes
        );

        const totaisDespesas = this.totaisPorCadaDiaMes(
          dados.filter(dado => dado.tipo === 'DESPESA'),
          diasDoMes
        );

        this.lineChartData = {
          labels: diasDoMes,
          datasets: [
            {
              label: 'Receitas',
              data: totaisReceitas,
              borderColor: '#3366CC'
            },
            {
              label: 'Despesas',
              data: totaisDespesas,
              borderColor: '#D62B00'
            }
          ]
        }
      });
  }

  private totaisPorCadaDiaMes(dados: any[], diasDoMes: number[]) {

    const totais: number[] = [];

    for (let dia of diasDoMes) {
      let total = 0;

      for (const dado of dados) {
        if (dado.dia.getDate() === dia) {
          total = dado.total;
          break;
        }
      }

      totais.push(total);

    }

    return totais;

  }

  private configurarDiasMes(mesReferencia: Date) {

    mesReferencia.setMonth(mesReferencia.getMonth() + 1);
    mesReferencia.setDate(0);

    const quantidade = mesReferencia.getDate();

    const dias: number[] = [];

    for (let i = 1; i <= quantidade; i++) {
      dias.push(i);
    }

    return dias;
  }
}
