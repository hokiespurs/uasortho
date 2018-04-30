%% 
syms f cx cy 
syms Xc Yc Zc Xw Yw Zw u v

R = sym('R%d%d', [3 3]);
K = [f 0 cx;0 f cy;0 0 1];

R = sym('R%d%d', [3 3]);


UVS = K * R * [Xw-Xc; Yw-Yc; Zw-Zc];

Eqn(1,1) = u == UVS(1)/UVS(3);
Eqn(2,1) = v == UVS(2)/UVS(3);
Eqn(3,1) = s == UVS(3);
Eqn(4,1) = Zw == 0;

sol = solve(Eqn,[Xw Yw Zw s]);

strXeqn = sprintf('Xw = %s',sol.Xw);
strYeqn = sprintf('Yw = %s',sol.Yw);

oldstr = {'sin','cos','^','f','cx','cy','Xc','Yc','Zc','roll','pitch','yaw'}; 
newstr = {'Math.sin',...
             'Math.cos',...
             '**',...
             'this.IO.f',...
             'this.IO.cx',...
             'this.IO.cy',...
             'this.EO.Xc',...
             'this.EO.Yc',...
             'this.EO.Zc',...
             'this.EO.roll',...
             'this.EO.pitch',...
             'this.EO.yaw'};
         
for i=1:numel(oldstr)
    strXeqn = strrep(strXeqn,oldstr{i},newstr{i});
    strYeqn = strrep(strYeqn,oldstr{i},newstr{i});
end
strXeqn = linewrap([strXeqn ';'],10000);
strYeqn = linewrap([strYeqn ';'],10000);
clc
for i=1:numel(strXeqn)
    fprintf('%s\n',strXeqn{i});
end
fprintf('\n');
for i=1:numel(strYeqn)
    fprintf('%s\n',strYeqn{i});
end
% fprintf('Xw = %s\n',

