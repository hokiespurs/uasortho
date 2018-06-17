
%% 
% K = [f 0 cx;0 f cy;0 0 1];
% R = sym('R%d%d', [3 3]);

syms pixx pixy u v s Xw Yw Zw

P = sym('P%d%d', [3 4]);

UVS = P * [Xw;Yw;Zw;1];

Eqn(1,1) = pixx == UVS(1)/UVS(3);
Eqn(2,1) = pixy == UVS(2)/UVS(3);
Eqn(3,1) = s == UVS(3);
Eqn(4,1) = Zw == 0;

sol = solve(Eqn,[Xw Yw Zw s]);

%%
strXeqn = sprintf('Xw = %s',sol.Xw);
strYeqn = sprintf('Yw = %s',sol.Yw);
strSeqn = sprintf('s = %s',sol.s);

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
    strSeqn = strrep(strSeqn,oldstr{i},newstr{i});
end

for i=0:2
    for j=0:3
        strXeqn = strrep(strXeqn,sprintf('P%i%i',i+1,j+1),sprintf('P[%i][%i]',i,j));
        strYeqn = strrep(strYeqn,sprintf('P%i%i',i+1,j+1),sprintf('P[%i][%i]',i,j));
        strSeqn = strrep(strSeqn,sprintf('P%i%i',i+1,j+1),sprintf('P[%i][%i]',i,j));
    end
end
clc
fprintf('var %s;\n',strXeqn,strYeqn,strSeqn);

%% For Matlab
%%
strXeqn = sprintf('Xw = %s',sol.Xw);
strYeqn = sprintf('Yw = %s',sol.Yw);
strSeqn = sprintf('s = %s',sol.s);

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
    strSeqn = strrep(strSeqn,oldstr{i},newstr{i});
end

for i=1:3
    for j=1:4
        strXeqn = strrep(strXeqn,sprintf('P%i%i',i,j),sprintf('P(%i,%i)',i,j));
        strYeqn = strrep(strYeqn,sprintf('P%i%i',i,j),sprintf('P(%i,%i)',i,j));
        strSeqn = strrep(strSeqn,sprintf('P%i%i',i,j),sprintf('P(%i,%i)',i,j));
    end
end
fprintf('MATLAB\n');
fprintf('%s;\n',strXeqn,strYeqn,strSeqn);


%% Calc P
syms f cx cy roll pitch yaw Xc Yc Zc

K = [f 0 cx;0 f cy;0 0 1];

R_WORLD_2_AIR = [0 1 0;1 0 0;0 0 -1];
R_AIR_2_CAMERA = [0 1 0;-1 0 0;0 0 1];
R_AIR_ROLL = [1 0 0; 0 cos(roll) sin(roll); 0 -sin(roll) cos(roll)];
R_AIR_PITCH = [cos(pitch) 0 -sin(pitch); 0 1 0;sin(pitch) 0 cos(pitch)];
R_AIR_YAW = [cos(yaw) sin(yaw) 0; -sin(yaw) cos(yaw) 0; 0 0 1];
R = R_AIR_2_CAMERA * R_AIR_ROLL * R_AIR_PITCH * R_AIR_YAW * R_WORLD_2_AIR;

P = K * R * [eye(3) [-Xc;-Yc;-Zc]];
str = [];
for i=0:2
    for j=0:3
        str{j+1} = sprintf('%s',P(i+1,j+1));
        for k=1:numel(oldstr)
            str{j+1} = strrep(str{j+1},oldstr{k},newstr{k});
        end
    end
    fprintf('P%i = [%s,\n\t\t%s,\n\t\t%s,\n\t\t%s];\n',i+1,str{1},str{2},str{3},str{4});
end

%% test code
clear
f = 4000;
cx = 2000;
cy = 1500;
roll=0;
pitch=0;
yaw=0;
Xc = 478176.01598210674;
Yc = 4934930.361397228;
Zc = 200;
pixx = 2000;
pixy = 1500;

K = [f 0 cx;0 f cy;0 0 1];

% R2TaitBryan = [0 1 0;1 0 0;0 0 -1];
% Rx = [1 0 0; 0 cos(roll) sin(roll); 0 -sin(roll) cos(roll)];
% Ry = [cos(pitch) 0 -sin(pitch); 0 1 0;sin(pitch) 0 cos(pitch)];
% Rz = [cos(yaw) sin(yaw) 0; -sin(yaw) cos(yaw) 0; 0 0 1];
% R = Rx*Ry*Rz*R2TaitBryan;
R_WORLD_2_AIR = [0 1 0;1 0 0;0 0 -1];
R_AIR_2_CAMERA = [0 1 0;-1 0 0;0 0 1];
R_AIR_ROLL = [1 0 0; 0 cos(roll) sin(roll); 0 -sin(roll) cos(roll)];
R_AIR_PITCH = [cos(pitch) 0 -sin(pitch); 0 1 0;sin(pitch) 0 cos(pitch)];
R_AIR_YAW = [cos(yaw) sin(yaw) 0; -sin(yaw) cos(yaw) 0; 0 0 1];
R = R_AIR_2_CAMERA * R_AIR_ROLL * R_AIR_PITCH * R_AIR_YAW * R_WORLD_2_AIR;

P = K * R * [eye(3) [-Xc;-Yc;-Zc]];

Xw = 478176.01598210674;
Yw = 4934930.361397228;
Zw = 0;

uvs = P*[Xw;Yw;Zw;1];
fprintf('s=%g\n',uvs(3));
fprintf('x: %g\t y:%g\n',uvs(1)/uvs(3),uvs(2)/uvs(3));

Xw = (P(1,2)*P(2,4) - P(1,4)*P(2,2) - P(1,2)*P(3,4)*pixy + P(1,4)*P(3,2)*pixy + P(2,2)*P(3,4)*pixx - P(2,4)*P(3,2)*pixx)/(P(1,1)*P(2,2) - P(1,2)*P(2,1) - P(1,1)*P(3,2)*pixy + P(1,2)*P(3,1)*pixy + P(2,1)*P(3,2)*pixx - P(2,2)*P(3,1)*pixx);
Yw = -(P(1,1)*P(2,4) - P(1,4)*P(2,1) - P(1,1)*P(3,4)*pixy + P(1,4)*P(3,1)*pixy + P(2,1)*P(3,4)*pixx - P(2,4)*P(3,1)*pixx)/(P(1,1)*P(2,2) - P(1,2)*P(2,1) - P(1,1)*P(3,2)*pixy + P(1,2)*P(3,1)*pixy + P(2,1)*P(3,2)*pixx - P(2,2)*P(3,1)*pixx);
s = (P(1,1)*P(2,2)*P(3,4) - P(1,1)*P(2,4)*P(3,2) - P(1,2)*P(2,1)*P(3,4) + P(1,2)*P(2,4)*P(3,1) + P(1,4)*P(2,1)*P(3,2) - P(1,4)*P(2,2)*P(3,1))/(P(1,1)*P(2,2) - P(1,2)*P(2,1) - P(1,1)*P(3,2)*pixy + P(1,2)*P(3,1)*pixy + P(2,1)*P(3,2)*pixx - P(2,2)*P(3,1)*pixx);

fprintf('dX: %g\tdY: %g\ts: %g\n',Xw-Xc,Yw-Yc,s);
%% More Tests
Xc = 0;  Xw = 0;
Yc = 0;  Yw = 0;
Zc = 10; Zw = 0;
roll  = 0;
pitch = 0;
yaw   = 0;

R_WORLD_2_AIR = [0 1 0;1 0 0;0 0 -1];
R_AIR_2_CAMERA = [0 1 0;-1 0 0;0 0 1];

R_AIR_ROLL = [1 0 0; 0 cos(roll) sin(roll); 0 -sin(roll) cos(roll)];
R_AIR_PITCH = [cos(pitch) 0 -sin(pitch); 0 1 0;sin(pitch) 0 cos(pitch)];
R_AIR_YAW = [cos(yaw) sin(yaw) 0; -sin(yaw) cos(yaw) 0; 0 0 1];

R = R_AIR_2_CAMERA * R_AIR_ROLL * R_AIR_PITCH * R_AIR_YAW * R_WORLD_2_AIR;
RT = [R * [eye(3) -1*[Xc;Yc;Zc]]];

RT * [0;0;1;1]

%% 
R = sym('R%d%d', [2 2]);

cornerazel = sym('A%d%d',[4 2]);

val = cornerazel*R;
for ii=1:4
    str = sprintf('rotazel[%i] = [%s,%s];\n',ii-1,val(ii,:));
    for i=0:5
        for j=0:5
            str = strrep(str,sprintf('A%i%i',i+1,j+1),sprintf('cornerazel[%i][%i]',i,j));
            str = strrep(str,sprintf('R%i%i',i+1,j+1),sprintf('R[%i][%i]',i,j));
        end
    end
    fprintf('%s',str)
end

%% Solve for Pitch and Yaw Given Roll